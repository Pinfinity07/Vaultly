const expenseService = require('../src/services/expense.service');
const prisma = require('../src/lib/prisma');

jest.mock('../src/lib/prisma', () => ({
  categories: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  expenses: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Expense Service & Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createExpense Validation', () => {
    it('should reject non-numeric amount', async () => {
      await expect(
        expenseService.createExpense({
          userId: 'user-1',
          amount: 'not-a-number',
          categoryId: 'Groceries',
          date: '2026-03-01',
          description: 'Lunch',
        })
      ).rejects.toThrow('Invalid expense amount');
    });

    it('should reject negative amount', async () => {
      await expect(
        expenseService.createExpense({
          userId: 'user-1',
          amount: -50,
          categoryId: 'Groceries',
          date: '2026-03-01',
          description: 'Negative test',
        })
      ).rejects.toThrow('Invalid expense amount');
    });

    it('should reject zero amount', async () => {
      await expect(
        expenseService.createExpense({
          userId: 'user-1',
          amount: 0,
          categoryId: 'Groceries',
          date: '2026-03-01',
          description: 'Zero test',
        })
      ).rejects.toThrow('Invalid expense amount');
    });

    it('should perform case-insensitive category lookup when creating an expense', async () => {
      prisma.categories.findFirst.mockResolvedValue({ id: 'cat-1', name: 'Food' });
      prisma.expenses.create.mockResolvedValue({
        id: 'exp-1',
        amount: 25.5,
        userId: 'user-1',
        categoryId: 'cat-1',
        Categories: { name: 'Food' },
      });

      const result = await expenseService.createExpense({
        userId: 'user-1',
        amount: 25.5,
        categoryId: 'food',
        date: '2026-03-01',
        description: 'Chipotle',
      });

      expect(prisma.categories.findFirst).toHaveBeenCalledWith({
        where: { name: { equals: 'food', mode: 'insensitive' } },
      });
      expect(result.id).toBe('exp-1');
    });
  });

  describe('updateExpense Validation', () => {
    it('should reject updating to a negative or zero amount', async () => {
      prisma.expenses.findUnique.mockResolvedValue({
        id: 'exp-1',
        userId: 'user-1',
        amount: 20,
        categoryId: 'cat-1',
      });

      await expect(
        expenseService.updateExpense('exp-1', 'user-1', { amount: -10 })
      ).rejects.toThrow('Invalid expense amount');

      await expect(
        expenseService.updateExpense('exp-1', 'user-1', { amount: 0 })
      ).rejects.toThrow('Invalid expense amount');
    });
  });
});
