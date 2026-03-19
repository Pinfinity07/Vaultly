const prisma = require("../lib/prisma");

async function createExpense({ userId, amount, categoryId, date, description, groupId = null }) {
    try{
        // Find or create category by name
        let category = await prisma.categories.findFirst({
            where: { name: categoryId }
        });

        if (!category) {
            // Create category if it doesn't exist
            category = await prisma.categories.create({
                data: { name: categoryId }
            });
        }

        const expense = await prisma.expenses.create({
            data: {
                userId,
                amount,
                categoryId: category.id,
                date: new Date(date),
                description,
                groupId
            },
            include: {
                Categories: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Format expense to match getUserExpenses format
        return {
            id: expense.id,
            date: expense.date,
            description: expense.description,
            category: expense.Categories.name,
            amount: expense.amount,
            userId: expense.userId,
            groupId: expense.groupId
        };
    }catch(error){
        console.error('Service error:', error);
        throw new Error("Error creating expense: " + error.message);
    }
}

async function getUserExpenses(userId, options = {}){
    try{
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'date',
            sortOrder = 'desc',
            category = 'all',
            startDate = '',
            endDate = ''
        } = options;

        // Build where clause
        const where = { userId };
        const andConditions = [];

        // Add search filter
        if (search) {
            andConditions.push({
                OR: [
                    { description: { contains: search, mode: 'insensitive' } },
                    { Categories: { name: { contains: search, mode: 'insensitive' } } }
                ]
            });
        }

        // Add category filter
        if (category !== 'all') {
            andConditions.push({
                Categories: { 
                    name: { equals: category }
                }
            });
        }

        // Add date range filter
        const dateFilter = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate);
        }
        if (Object.keys(dateFilter).length > 0) {
            andConditions.push({ date: dateFilter });
        }

        // Combine all conditions
        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        // Build orderBy clause
        let orderBy = {};
        if (sortBy === 'date') {
            orderBy = { date: sortOrder };
        } else if (sortBy === 'amount') {
            orderBy = { amount: sortOrder };
        } else if (sortBy === 'category') {
            orderBy = { Categories: { name: sortOrder } };
        }

        // Get total count for pagination
        const totalCount = await prisma.expenses.count({ where });

        // Calculate pagination
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil(totalCount / limit);

        // Fetch paginated expenses
        const expenses = await prisma.expenses.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            include: {
                Categories: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Format expenses to include category name
        const formattedExpenses = expenses.map(expense => ({
            id: expense.id,
            date: expense.date,
            description: expense.description,
            category: expense.Categories.name,
            amount: expense.amount,
            userId: expense.userId,
            groupId: expense.groupId
        }));

        return {
            expenses: formattedExpenses,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    }catch(error){
        throw new Error("Error fetching expenses: " + error.message);
    }
}

async function deleteExpense(expenseId, userId) {
    try {
        // Verify the expense belongs to the user before deleting
        const expense = await prisma.expenses.findUnique({
            where: { id: expenseId }
        });

        if (!expense) {
            throw new Error("Expense not found");
        }

        if (expense.userId !== userId) {
            throw new Error("Unauthorized to delete this expense");
        }

        await prisma.expenses.delete({
            where: { id: expenseId }
        });

        return { success: true };
    } catch (error) {
        throw new Error("Error deleting expense: " + error.message);
    }
}

async function updateExpense(expenseId, userId, updateData){
    try{
        const expense = await prisma.expenses.findUnique({
            where: { id: expenseId }
        });

        if(!expense){
            throw new Error("Expense not found");
        }

        if(expense.userId !== userId){
            throw new Error("Unauthorized to update this expense");
        }

        // Handle category if provided
        let categoryId = expense.categoryId;
        if(updateData.categoryId){
            let category = await prisma.categories.findFirst({
                where: { name: updateData.categoryId }
            });

            if (!category) {
                category = await prisma.categories.create({
                    data: { name: updateData.categoryId }
                });
            }
            categoryId = category.id;
        }

        // Prepare update data
        const dataToUpdate = {
            amount: updateData.amount !== undefined ? updateData.amount : expense.amount,
            categoryId: categoryId,
            date: updateData.date ? new Date(updateData.date) : expense.date,
            description: updateData.description !== undefined ? updateData.description : expense.description,
        };

        const updatedExpense = await prisma.expenses.update({
            where: { id: expenseId },
            data: dataToUpdate,
            include: {
                Categories: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return {
            id: updatedExpense.id,
            date: updatedExpense.date,
            description: updatedExpense.description,
            category: updatedExpense.Categories.name,
            amount: updatedExpense.amount,
            userId: updatedExpense.userId,
            groupId: updatedExpense.groupId
        };
    }catch(error){
        throw new Error("Error updating expense: " + error.message);
    }
}

module.exports = {
    createExpense,
    getUserExpenses,
    deleteExpense,
    updateExpense
};