const goalService = require('../services/goal.service');

async function createGoal(req, res) {
    const { name, targetAmount, deadline, description } = req.body;
    const userId = req.userId;

    if (!name || !targetAmount) {
        return res.status(400).json({ error: 'Name and target amount are required' });
    }

    if (targetAmount <= 0) {
        return res.status(400).json({ error: 'Target amount must be positive' });
    }

    try {
        const goal = await goalService.createGoal({ userId, name, targetAmount, deadline, description });
        return res.status(201).json({ success: true, goal });
    } catch (error) {
        console.error('Create goal error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getUserGoals(req, res) {
    const userId = req.userId;

    try {
        const goals = await goalService.getUserGoals(userId);
        return res.status(200).json({ success: true, goals });
    } catch (error) {
        console.error('Get user goals error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getGoalById(req, res) {
    const { goalId } = req.params;
    const userId = req.userId;

    try {
        const goal = await goalService.getGoalById(goalId, userId);
        return res.status(200).json({ success: true, goal });
    } catch (error) {
        console.error('Get goal by id error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateGoal(req, res) {
    const { goalId } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    // Validate targetAmount if provided
    if (updateData.targetAmount !== undefined && updateData.targetAmount <= 0) {
        return res.status(400).json({ error: 'Target amount must be positive' });
    }

    try {
        const goal = await goalService.updateGoal(goalId, userId, updateData);
        return res.status(200).json({ success: true, goal });
    } catch (error) {
        console.error('Update goal error:', error);
        const statusCode = error.message.includes('cannot be less than') ? 400 : 500;
        return res.status(statusCode).json({ error: statusCode === 400 ? error.message : 'Internal server error' });
    }
}

async function deleteGoal(req, res) {
    const { goalId } = req.params;
    const userId = req.userId;

    try {
        await goalService.deleteGoal(goalId, userId);
        return res.status(200).json({ success: true, message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Delete goal error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function contributeToGoal(req, res) {
    const { goalId } = req.params;
    const { amount } = req.body;
    const userId = req.userId;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid contribution amount is required' });
    }

    try {
        const goal = await goalService.contributeToGoal(goalId, userId, parseFloat(amount));
        return res.status(200).json({ success: true, goal });
    } catch (error) {
        console.error('Contribute to goal error:', error);
        return res.status(500).json({ error: 'Internal server error' });
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
