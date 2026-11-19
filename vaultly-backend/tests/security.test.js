const request = require('supertest');
const prisma = require('../src/lib/prisma');
const app = require('../src/server');

jest.mock('../src/lib/prisma', () => ({
  users: { findUnique: jest.fn(), create: jest.fn() },
}));

// Stand-in for Google: the test sets what userinfo returns.
const mockUserInfo = jest.fn();
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        generateAuthUrl: () => 'https://accounts.google.com/o/oauth2/auth',
        getToken: async () => ({ tokens: { access_token: 'google-token' } }),
        setCredentials: () => {},
      })),
    },
    oauth2: () => ({ userinfo: { get: async () => ({ data: mockUserInfo() }) } }),
  },
}));

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

// Runs the callback with a matching state cookie, as a real browser round trip would.
const googleCallback = () =>
  request(app)
    .get('/auth/google/callback?code=abc&state=s1')
    .set('Cookie', ['oauth_state=s1']);

describe('Google sign-in only trusts verified emails', () => {
  beforeEach(() => jest.clearAllMocks());

  it('refuses an unverified email without looking up or creating an account', async () => {
    mockUserInfo.mockReturnValue({ email: 'victim@example.com', verified_email: false, name: 'Mallory' });

    const res = await googleCallback();

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`${FRONTEND}/login?error=unverified_email`);
    expect(prisma.users.findUnique).not.toHaveBeenCalled();
    expect(prisma.users.create).not.toHaveBeenCalled();
    expect(res.headers['set-cookie'] || []).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/^accessToken=/)])
    );
  });

  it('refuses a profile that does not say whether the email is verified', async () => {
    mockUserInfo.mockReturnValue({ email: 'victim@example.com', name: 'Mallory' });

    const res = await googleCallback();

    expect(res.headers.location).toBe(`${FRONTEND}/login?error=unverified_email`);
    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('signs in an existing user when Google has verified the email', async () => {
    mockUserInfo.mockReturnValue({ email: 'asha@example.com', verified_email: true, name: 'Asha' });
    prisma.users.findUnique.mockResolvedValue({ id: 'user-1', email: 'asha@example.com', role: 'user' });

    const res = await googleCallback();

    expect(res.headers.location).toBe(`${FRONTEND}/dashboard`);
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringMatching(/^accessToken=/), expect.stringMatching(/^refreshToken=/)])
    );
  });
});

describe('CORS only allows exact origins', () => {
  it.each([
    'https://vaultly-attacker.vercel.app',
    'https://vaultlyevil.vercel.app',
    'https://vaultly-one.vercel.app.evil.com',
    'https://evil.com',
  ])('does not grant credentialed access to %s', async (origin) => {
    const res = await request(app).get('/health').set('Origin', origin);

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it.each(['https://vaultly-one.vercel.app', 'http://localhost:3000'])('allows %s with credentials', async (origin) => {
    const res = await request(app).get('/health').set('Origin', origin);

    expect(res.headers['access-control-allow-origin']).toBe(origin);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
