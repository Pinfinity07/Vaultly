const request = require('supertest');
const app = require('../src/server');
const authService = require('../src/services/auth.service');

describe('Authentication & Token Architecture', () => {
  describe('Health Check', () => {
    it('should return 200 and server status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok', message: 'Server is awake' });
    });
  });

  describe('JWT Token Services', () => {
    const payload = { userId: 'test-user-123', role: 'user' };

    it('should generate and verify an access token', () => {
      const token = authService.generateAccessToken(payload);
      expect(typeof token).toBe('string');

      const verified = authService.verifyAccessToken(token);
      expect(verified).not.toBeNull();
      expect(verified.userId).toBe(payload.userId);
      expect(verified.role).toBe(payload.role);
    });

    it('should generate and verify a refresh token', () => {
      const token = authService.generateRefreshToken(payload);
      expect(typeof token).toBe('string');

      const verified = authService.verifyRefreshToken(token);
      expect(verified).not.toBeNull();
      expect(verified.userId).toBe(payload.userId);
      expect(verified.role).toBe(payload.role);
    });

    it('should return null when verifying an invalid token', () => {
      expect(authService.verifyAccessToken('invalid.token.signature')).toBeNull();
      expect(authService.verifyRefreshToken('invalid.token.signature')).toBeNull();
    });

    it('should hash passwords and verify matches accurately', async () => {
      const password = 'SuperSecretPassword123!';
      const hash = await authService.hashPassword(password);
      expect(hash).not.toBe(password);

      const isValid = await authService.comparePassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await authService.comparePassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Auth Endpoints & Error Handling', () => {
    it('should reject refresh when refresh token is missing', async () => {
      const res = await request(app).post('/auth/refresh');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Refresh token missing');
    });

    it('should reject refresh when refresh token is invalid', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .set('Cookie', ['refreshToken=bad.token.value']);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid or expired refresh token');
    });

    it('should reject protected endpoint /auth/me when access token is missing', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Access token missing');
    });

    it('should clear both accessToken and refreshToken cookies on logout', async () => {
      const res = await request(app).post('/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');

      const setCookies = res.headers['set-cookie'] || [];
      const hasClearedAccess = setCookies.some((c) => c.includes('accessToken=;'));
      const hasClearedRefresh = setCookies.some((c) => c.includes('refreshToken=;'));
      expect(hasClearedAccess).toBe(true);
      expect(hasClearedRefresh).toBe(true);
    });
  });
});
