const prisma = require("../lib/prisma");

async function getUserById(userId) {
    try {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    } catch (error) {
        throw new Error("Error fetching user: " + error.message);
    }
}

async function updateUserById(userId, updateData) {
    try {
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Prepare update data (only allow updating full_name and email)
        const dataToUpdate = {};
        
        if (updateData.full_name !== undefined) {
            dataToUpdate.full_name = updateData.full_name;
        }
        
        if (updateData.email !== undefined) {
            // Check if email is already taken by another user
            const existingUser = await prisma.users.findFirst({
                where: {
                    email: updateData.email,
                    NOT: { id: userId }
                }
            });

            if (existingUser) {
                throw new Error("Email already in use");
            }

            dataToUpdate.email = updateData.email;
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return updatedUser;
    } catch (error) {
        throw new Error("Error updating user: " + error.message);
    }
}

module.exports = {
    getUserById,
    updateUserById
};