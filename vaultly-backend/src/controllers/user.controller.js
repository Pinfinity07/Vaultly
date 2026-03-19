const userService = require('../services/user.service');

async function getUserById(req, res) {
    const { id } = req.params;
    const requestingUserId = req.userId;

    // Users can only access their own data unless they're admin
    if (id !== requestingUserId && req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Cannot access other user data' });
    }

    try {
        const user = await userService.getUserById(id);
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateUserById(req, res) {
    const { id } = req.params;
    const requestingUserId = req.userId;
    const updateData = req.body;

    // Users can only update their own data unless they're admin
    if (id !== requestingUserId && req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Cannot update other user data' });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No data provided for update' });
    }

    try {
        const updatedUser = await userService.updateUserById(id, updateData);
        return res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error('Update user error:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('already in use')) {
            return res.status(409).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getUserById,
    updateUserById
};