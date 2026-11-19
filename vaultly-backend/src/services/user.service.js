const bcrypt = require("bcrypt");
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
        
        if (updateData.email !== undefined && updateData.email !== user.email) {
            // Google sign-in matches accounts by email, so changing it must prove the
            // account owner is here: a stolen session alone must not be able to repoint it.
            if (!user.passwordHash) {
                throw new Error("Email is managed by Google sign-in");
            }
            const passwordOk = typeof updateData.currentPassword === "string"
                && await bcrypt.compare(updateData.currentPassword, user.passwordHash);
            if (!passwordOk) {
                throw new Error("Current password is incorrect");
            }

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