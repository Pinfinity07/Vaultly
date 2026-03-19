const prisma = require("../lib/prisma");

async function createGoal({ userId, name, targetAmount, deadline, description }) {
    try {
        const goal = await prisma.goals.create({
            data: {
                userId,
                name,
                targetAmount,
                currentAmount: 0,
                deadline: deadline ? new Date(deadline) : null,
                description: description || ''
            }
        });

        return {
            id: goal.id,
            userId: goal.userId,
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            deadline: goal.deadline,
            description: goal.description,
            createdAt: goal.createdAt,
            updatedAt: goal.updatedAt
        };
    } catch (error) {
        console.error('Service error:', error);
        throw new Error("Error creating goal: " + error.message);
    }
}

async function getUserGoals(userId) {
    try {
        const goals = await prisma.goals.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return goals.map(goal => ({
            id: goal.id,
            userId: goal.userId,
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            deadline: goal.deadline,
            description: goal.description,
            progress: goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0,
            createdAt: goal.createdAt,
            updatedAt: goal.updatedAt
        }));
    } catch (error) {
        throw new Error("Error fetching goals: " + error.message);
    }
}

async function getGoalById(goalId, userId) {
    try {
        const goal = await prisma.goals.findUnique({
            where: { id: goalId }
        });

        if (!goal) {
            throw new Error("Goal not found");
        }

        if (goal.userId !== userId) {
            throw new Error("Unauthorized to access this goal");
        }

        return {
            id: goal.id,
            userId: goal.userId,
            name: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            deadline: goal.deadline,
            description: goal.description,
            progress: goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0,
            createdAt: goal.createdAt,
            updatedAt: goal.updatedAt
        };
    } catch (error) {
        throw new Error("Error fetching goal: " + error.message);
    }
}

async function updateGoal(goalId, userId, updateData) {
    try {
        // Verify ownership
        const goal = await prisma.goals.findUnique({
            where: { id: goalId }
        });

        if (!goal) {
            throw new Error("Goal not found");
        }

        if (goal.userId !== userId) {
            throw new Error("Unauthorized to update this goal");
        }

        // Validate targetAmount is not less than currentAmount
        if (updateData.targetAmount && updateData.targetAmount < goal.currentAmount) {
            throw new Error("Target amount cannot be less than current amount");
        }

        const updatedGoal = await prisma.goals.update({
            where: { id: goalId },
            data: {
                ...(updateData.name && { name: updateData.name }),
                ...(updateData.targetAmount && { targetAmount: updateData.targetAmount }),
                ...(updateData.deadline !== undefined && { deadline: updateData.deadline ? new Date(updateData.deadline) : null }),
                ...(updateData.description !== undefined && { description: updateData.description })
            }
        });

        return {
            id: updatedGoal.id,
            userId: updatedGoal.userId,
            name: updatedGoal.name,
            targetAmount: updatedGoal.targetAmount,
            currentAmount: updatedGoal.currentAmount,
            deadline: updatedGoal.deadline,
            description: updatedGoal.description,
            progress: updatedGoal.targetAmount > 0 ? Math.min((updatedGoal.currentAmount / updatedGoal.targetAmount) * 100, 100) : 0,
            createdAt: updatedGoal.createdAt,
            updatedAt: updatedGoal.updatedAt
        };
    } catch (error) {
        throw new Error("Error updating goal: " + error.message);
    }
}

async function deleteGoal(goalId, userId) {
    try {
        // Verify ownership
        const goal = await prisma.goals.findUnique({
            where: { id: goalId }
        });

        if (!goal) {
            throw new Error("Goal not found");
        }

        if (goal.userId !== userId) {
            throw new Error("Unauthorized to delete this goal");
        }

        await prisma.goals.delete({
            where: { id: goalId }
        });

        return { success: true };
    } catch (error) {
        throw new Error("Error deleting goal: " + error.message);
    }
}

async function contributeToGoal(goalId, userId, amount) {
    try {
        // Verify ownership
        const goal = await prisma.goals.findUnique({
            where: { id: goalId }
        });

        if (!goal) {
            throw new Error("Goal not found");
        }

        if (goal.userId !== userId) {
            throw new Error("Unauthorized to contribute to this goal");
        }

        if (amount <= 0) {
            throw new Error("Contribution amount must be positive");
        }

        // Allow over-contribution but cap currentAmount at reasonable limit
        const newAmount = goal.currentAmount + amount;
        
        const updatedGoal = await prisma.goals.update({
            where: { id: goalId },
            data: {
                currentAmount: newAmount
            }
        });

        return {
            id: updatedGoal.id,
            userId: updatedGoal.userId,
            name: updatedGoal.name,
            targetAmount: updatedGoal.targetAmount,
            currentAmount: updatedGoal.currentAmount,
            deadline: updatedGoal.deadline,
            description: updatedGoal.description,
            progress: updatedGoal.targetAmount > 0 ? Math.min((updatedGoal.currentAmount / updatedGoal.targetAmount) * 100, 100) : 0,
            createdAt: updatedGoal.createdAt,
            updatedAt: updatedGoal.updatedAt
        };
    } catch (error) {
        throw new Error("Error contributing to goal: " + error.message);
    }
}

module.exports = {
    createGoal,
    getUserGoals,
    getGoalById,
    updateGoal,
    deleteGoal,
    contributeToGoal
};
