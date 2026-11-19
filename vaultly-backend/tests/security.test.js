const request = require('supertest');
const bcrypt = require('bcrypt');
const prisma = require('../src/lib/prisma');
const app = require('../src/server');
const authService = require('../src/services/auth.service');

jest.mock('../src/lib/prisma', () => ({
  users: { findUnique: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
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

describe('Access and refresh tokens are not interchangeable', () => {
  beforeEach(() => jest.clearAllMocks());
  const user = { id: 'user-1', email: 'asha@example.com', full_name: 'Asha', role: 'user', passwordHash: 'x' };

  it('rejects a refresh token used as an access token', async () => {
    const refresh = authService.generateRefreshToken({ userId: 'user-1', role: 'user' });

    const res = await request(app).get('/auth/me').set('Cookie', [`accessToken=${refresh}`]);

    expect(res.status).toBe(401);
  });

  it('rejects an access token used to refresh the session', async () => {
    const access = authService.generateAccessToken({ userId: 'user-1', role: 'user' });

    const res = await request(app).post('/auth/refresh').set('Cookie', [`refreshToken=${access}`]);

    expect(res.status).toBe(401);
    expect(prisma.users.findUnique).not.toHaveBeenCalled();
  });

  it('still accepts each token for its own purpose', async () => {
    prisma.users.findUnique.mockResolvedValue(user);
    const access = authService.generateAccessToken({ userId: 'user-1', role: 'user' });
    const refresh = authService.generateRefreshToken({ userId: 'user-1', role: 'user' });

    expect((await request(app).get('/auth/me').set('Cookie', [`accessToken=${access}`])).status).toBe(200);
    expect((await request(app).post('/auth/refresh').set('Cookie', [`refreshToken=${refresh}`])).status).toBe(200);
  });
});

describe('Changing email needs the current password', () => {
  let passwordHash;
  beforeAll(async () => {
    passwordHash = await bcrypt.hash('Correct-horse-1', 4);
  });
  beforeEach(() => jest.clearAllMocks());

  const cookie = () => `accessToken=${authService.generateAccessToken({ userId: 'user-1', role: 'user' })}`;
  const updateProfile = (body) => request(app).put('/users/user-1').set('Cookie', [cookie()]).send(body);

  it('refuses a new email without the current password', async () => {
    prisma.users.findUnique.mockResolvedValue({ id: 'user-1', email: 'asha@example.com', passwordHash });

    const res = await updateProfile({ email: 'someone-else@example.com' });

    expect(res.status).toBe(403);
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('refuses a new email with the wrong password', async () => {
    prisma.users.findUnique.mockResolvedValue({ id: 'user-1', email: 'asha@example.com', passwordHash });

    const res = await updateProfile({ email: 'someone-else@example.com', currentPassword: 'guess' });

    expect(res.status).toBe(403);
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('refuses email changes on accounts that only sign in with Google', async () => {
    prisma.users.findUnique.mockResolvedValue({ id: 'user-1', email: 'asha@gmail.com', passwordHash: '' });

    const res = await updateProfile({ email: 'someone-else@example.com', currentPassword: '' });

    expect(res.status).toBe(400);
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('changes the email with the right password', async () => {
    prisma.users.findUnique.mockResolvedValue({ id: 'user-1', email: 'asha@example.com', passwordHash });
    prisma.users.findFirst.mockResolvedValue(null);
    prisma.users.update.mockResolvedValue({ id: 'user-1', email: 'asha.new@example.com', full_name: 'Asha' });

    const res = await updateProfile({ email: 'asha.new@example.com', currentPassword: 'Correct-horse-1' });

    expect(res.status).toBe(200);
    expect(prisma.users.update).toHaveBeenCalledWith(expect.objectContaining({ data: { email: 'asha.new@example.com' } }));
  });

  it('lets a name change through without a password, even if the same email is sent back', async () => {
    prisma.users.findUnique.mockResolvedValue({ id: 'user-1', email: 'asha@example.com', passwordHash });
    prisma.users.update.mockResolvedValue({ id: 'user-1', email: 'asha@example.com', full_name: 'Asha R' });

    const res = await updateProfile({ full_name: 'Asha R', email: 'asha@example.com' });

    expect(res.status).toBe(200);
    expect(prisma.users.update).toHaveBeenCalledWith(expect.objectContaining({ data: { full_name: 'Asha R' } }));
  });
});
