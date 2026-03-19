const prisma = require("../lib/prisma");

async function getSpendingOverview(userId, startDate, endDate) {
    try {
        const where = {
            userId,
            ...(startDate && endDate && {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            })
        };

        // Total expenses
        const totalExpenses = await prisma.expenses.aggregate({
            where,
            _sum: { amount: true },
            _count: true
        });

        // Category breakdown
        const categoryBreakdown = await prisma.expenses.groupBy({
            by: ['categoryId'],
            where,
            _sum: { amount: true },
            _count: true
        });

        // Get category names
        const categoriesWithNames = await Promise.all(
            categoryBreakdown.map(async (cat) => {
                const category = await prisma.categories.findUnique({
                    where: { id: cat.categoryId }
                });
                return {
                    category: category?.name || 'Unknown',
                    amount: cat._sum.amount || 0,
                    count: cat._count
                };
            })
        );

        return {
            totalAmount: totalExpenses._sum.amount || 0,
            totalCount: totalExpenses._count || 0,
            categoryBreakdown: categoriesWithNames
        };
    } catch (error) {
        throw new Error("Error fetching spending overview: " + error.message);
    }
}

async function getMonthlyTrends(userId, months = 6) {
    try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const expenses = await prisma.expenses.findMany({
            where: {
                userId,
                date: { gte: startDate }
            },
            include: {
                Categories: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'asc' }
        });

        // Group by month
        const monthlyData = {};
        expenses.forEach(expense => {
            const monthKey = new Date(expense.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short' 
            });
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: monthKey,
                    totalAmount: 0,
                    count: 0,
                    categories: {}
                };
            }
            
            monthlyData[monthKey].totalAmount += expense.amount;
            monthlyData[monthKey].count += 1;
            
            const catName = expense.Categories.name;
            if (!monthlyData[monthKey].categories[catName]) {
                monthlyData[monthKey].categories[catName] = 0;
            }
            monthlyData[monthKey].categories[catName] += expense.amount;
        });

        return Object.values(monthlyData);
    } catch (error) {
        throw new Error("Error fetching monthly trends: " + error.message);
    }
}

async function getTopExpenses(userId, limit = 10) {
    try {
        const expenses = await prisma.expenses.findMany({
            where: { userId },
            include: {
                Categories: {
                    select: { name: true }
                }
            },
            orderBy: { amount: 'desc' },
            take: limit
        });

        return expenses.map(expense => ({
            id: expense.id,
            description: expense.description,
            amount: expense.amount,
            category: expense.Categories.name,
            date: expense.date
        }));
    } catch (error) {
        throw new Error("Error fetching top expenses: " + error.message);
    }
}

async function getGroupAnalytics(userId) {
    try {
        // Get all groups user is part of
        const userGroups = await prisma.groupMembers.findMany({
            where: { userId },
            include: {
                Groups: {
                    include: {
                        Expenses: {
                            include: {
                                Categories: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        const groupAnalytics = userGroups.map(member => {
            const group = member.Groups;
            const totalAmount = group.Expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const userExpenses = group.Expenses.filter(exp => exp.userId === userId);
            const userAmount = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);

            return {
                groupId: group.id,
                groupName: group.name,
                totalExpenses: group.Expenses.length,
                totalAmount,
                userExpenses: userExpenses.length,
                userAmount,
                userPercentage: totalAmount > 0 ? (userAmount / totalAmount) * 100 : 0
            };
        });

        return groupAnalytics;
    } catch (error) {
        throw new Error("Error fetching group analytics: " + error.message);
    }
}

async function getGoalsProgress(userId) {
    try {
        const goals = await prisma.goals.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const completed = goals.filter(g => g.currentAmount >= g.targetAmount).length;
        const inProgress = goals.filter(g => g.currentAmount < g.targetAmount).length;
        const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

        return {
            totalGoals: goals.length,
            completed,
            inProgress,
            totalSaved,
            totalTarget,
            overallProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
            goals: goals.map(g => ({
                id: g.id,
                name: g.name,
                currentAmount: g.currentAmount,
                targetAmount: g.targetAmount,
                progress: g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0,
                deadline: g.deadline
            }))
        };
    } catch (error) {
        throw new Error("Error fetching goals progress: " + error.message);
    }
}

async function getComparisonData(userId, period = 'month') {
    try {
        const now = new Date();
        let currentStart, previousStart, previousEnd;

        if (period === 'month') {
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
            previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (period === 'year') {
            currentStart = new Date(now.getFullYear(), 0, 1);
            previousStart = new Date(now.getFullYear() - 1, 0, 1);
            previousEnd = new Date(now.getFullYear() - 1, 11, 31);
        }

        const currentPeriod = await prisma.expenses.aggregate({
            where: {
                userId,
                date: { gte: currentStart }
            },
            _sum: { amount: true },
            _count: true
        });

        const previousPeriod = await prisma.expenses.aggregate({
            where: {
                userId,
                date: {
                    gte: previousStart,
                    lte: previousEnd
                }
            },
            _sum: { amount: true },
            _count: true
        });

        const currentAmount = currentPeriod._sum.amount || 0;
        const previousAmount = previousPeriod._sum.amount || 0;
        const percentageChange = previousAmount > 0 
            ? ((currentAmount - previousAmount) / previousAmount) * 100 
            : 0;

        return {
            period,
            current: {
                amount: currentAmount,
                count: currentPeriod._count || 0
            },
            previous: {
                amount: previousAmount,
                count: previousPeriod._count || 0
            },
            change: {
                amount: currentAmount - previousAmount,
                percentage: percentageChange
            }
        };
    } catch (error) {
        throw new Error("Error fetching comparison data: " + error.message);
    }
}

module.exports = {
    getSpendingOverview,
    getMonthlyTrends,
    getTopExpenses,
    getGroupAnalytics,
    getGoalsProgress,
    getComparisonData
};
