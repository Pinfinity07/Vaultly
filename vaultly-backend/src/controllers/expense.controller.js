const expenseService = require('../services/expense.service');

async function createExpense(req, res) {
    const { categoryId, amount, date, description, groupId = null } = req.body;
    const userId = req.userId;
    const numericAmount = Number(amount);

    if(!categoryId || amount === undefined || amount === null || !date) {
        return res.status(400).json({error: 'Missing required fields'});
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    try{
        const expense = await expenseService.createExpense({ userId, categoryId, amount: numericAmount, date, description: description || '', groupId });
        return res.status(201).json({ expense });
    }catch(error){
        console.error('Create expense error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getUserExpenses(req, res) {
    const userId = req.userId;
    const { 
        page = 1, 
        limit = 10, 
        search = '', 
        sortBy = 'date', 
        sortOrder = 'desc',
        category = 'all',
        startDate = '',
        endDate = ''
    } = req.query;

    try{
        const result = await expenseService.getUserExpenses(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            sortBy,
            sortOrder,
            category,
            startDate,
            endDate
        });
        return res.status(200).json(result);
    }catch(error){
        console.error('Get expenses error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteExpense(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    if (!id) {
        return res.status(400).json({ error: 'Expense ID is required' });
    }

    try {
        await expenseService.deleteExpense(id, userId);
        return res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateExpense(req, res){
    const { id } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    if(!id){
        return res.status(400).json({ error: 'Expense ID is required' });
    }

    if (updateData.amount !== undefined) {
        const numericAmount = Number(updateData.amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }
        updateData.amount = numericAmount;
    }

    try{
        const updatedExpense = await expenseService.updateExpense(id, userId, updateData);
        return res.status(200).json({ expense: updatedExpense });
    }catch(error){
        console.error('Update expense error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createExpense,
    getUserExpenses,
    deleteExpense,
    updateExpense,
};