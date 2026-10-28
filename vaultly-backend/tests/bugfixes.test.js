const request = require('supertest');
const prisma = require('../src/lib/prisma');
const app = require('../src/server');
const authService = require('../src/services/auth.service');
const goalService = require('../src/services/goal.service');
const { createOAuthClient } = require('../src/config/oauth.config');

jest.mock('../src/lib/prisma', () => ({
  groups: { findFirst: jest.fn() },
  categories: { findFirst: jest.fn(), create: jest.fn() },
  expenses: { create: jest.fn() },
  goals: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
}));

const authCookie = () =>
  `accessToken=${authService.generateAccessToken({ userId: 'user-1', role: 'user' })}`;

describe('Group expense authorization', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects an expense for a group the user does not belong to', async () => {
    prisma.groups.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/expenses')
      .set('Cookie', [authCookie()])
      .send({ categoryId: 'Food', amount: 20, date: '2026-10-01', groupId: 'group-x' });

    expect(res.status).toBe(403);
    expect(prisma.groups.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'group-x',
        OR: [{ createdBy: 'user-1' }, { GroupMembers: { some: { userId: 'user-1' } } }],
      },
      select: { id: true },
    });
    expect(prisma.expenses.create).not.toHaveBeenCalled();
  });

  it('allows an expense for a group the user belongs to', async () => {
    prisma.groups.findFirst.mockResolvedValue({ id: 'group-1' });
    prisma.categories.findFirst.mockResolvedValue({ id: 'cat-1', name: 'Food' });
    prisma.expenses.create.mockResolvedValue({
      id: 'exp-1', amount: 20, userId: 'user-1', groupId: 'group-1', Categories: { name: 'Food' },
    });

    const res = await request(app)
      .post('/expenses')
      .set('Cookie', [authCookie()])
      .send({ categoryId: 'Food', amount: 20, date: '2026-10-01', groupId: 'group-1' });

    expect(res.status).toBe(201);
    expect(res.body.expense.groupId).toBe('group-1');
  });

  it('skips the membership check for personal expenses', async () => {
    prisma.categories.findFirst.mockResolvedValue({ id: 'cat-1', name: 'Food' });
    prisma.expenses.create.mockResolvedValue({
      id: 'exp-2', amount: 5, userId: 'user-1', groupId: null, Categories: { name: 'Food' },
    });

    const res = await request(app)
      .post('/expenses')
      .set('Cookie', [authCookie()])
      .send({ categoryId: 'Food', amount: 5, date: '2026-10-01' });

    expect(res.status).toBe(201);
    expect(prisma.groups.findFirst).not.toHaveBeenCalled();
  });
});

describe('Goal amount validation', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(['abc', '', null, -5, 0])('rejects contribution amount %p', async (amount) => {
    const res = await request(app)
      .post('/goals/goal-1/contribute')
      .set('Cookie', [authCookie()])
      .send({ amount });

    expect(res.status).toBe(400);
    expect(prisma.goals.update).not.toHaveBeenCalled();
  });

  it('rejects a non-numeric target amount on create', async () => {
    const res = await request(app)
      .post('/goals')
      .set('Cookie', [authCookie()])
      .send({ name: 'Trip', targetAmount: 'abc' });

    expect(res.status).toBe(400);
    expect(prisma.goals.create).not.toHaveBeenCalled();
  });

  it('rejects a non-numeric target amount on update', async () => {
    const res = await request(app)
      .put('/goals/goal-1')
      .set('Cookie', [authCookie()])
      .send({ targetAmount: 'abc' });

    expect(res.status).toBe(400);
  });

  it('contributes with an atomic increment', async () => {
    prisma.goals.findUnique.mockResolvedValue({ id: 'goal-1', userId: 'user-1', currentAmount: 10 });
    prisma.goals.update.mockResolvedValue({ id: 'goal-1', userId: 'user-1', targetAmount: 100, currentAmount: 35 });

    const goal = await goalService.contributeToGoal('goal-1', 'user-1', 25);

    expect(prisma.goals.update).toHaveBeenCalledWith({
      where: { id: 'goal-1' },
      data: { currentAmount: { increment: 25 } },
    });
    expect(goal.currentAmount).toBe(35);
  });
});

describe('OAuth client isolation', () => {
  it('creates a separate client for each OAuth flow', () => {
    expect(createOAuthClient()).not.toBe(createOAuthClient());
  });
});
