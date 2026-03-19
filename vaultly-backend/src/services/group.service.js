const prisma = require('../lib/prisma');

// Create a new group
async function createGroup(userId, groupData) {
  try {
    const { name } = groupData;

      // Create the group
      const group = await prisma.groups.create({
        data: {
          name,
          createdBy: userId,
        },
        include: {
          Users: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
          GroupMembers: {
            include: {
              Users: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Add the creator as an admin member
      await prisma.groupMembers.create({
        data: {
          groupId: group.id,
          userId: userId,
          role: 'admin',
        },
      });

      // Fetch the complete group with members
      const completeGroup = await this.getGroupById(group.id, userId);

      return {
        success: true,
        group: completeGroup.group,
      };
    } catch (error) {
      console.error('Error creating group:', error);
      return {
        success: false,
        message: 'Failed to create group',
      };
    }
}

// Get all groups for a user (either created by them or they're a member)
async function getUserGroups(userId) {
  try {
    const groups = await prisma.groups.findMany({
      where: {
        OR: [
          { createdBy: userId },
          {
              GroupMembers: {
                some: {
                  userId: userId,
                },
              },
            },
          ],
        },
        include: {
          Users: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
          GroupMembers: {
            include: {
              Users: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                },
              },
            },
          },
          Expenses: {
            include: {
              Categories: true,
              Users: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              date: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform the data to camelCase
      const transformedGroups = groups.map((group) => ({
        id: group.id,
        name: group.name,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        creator: {
          id: group.Users.id,
          fullName: group.Users.full_name,
          email: group.Users.email,
        },
        members: group.GroupMembers.map((member) => ({
          id: member.id,
          role: member.role,
          joinedAt: member.joinedAt,
          user: {
            id: member.Users.id,
            fullName: member.Users.full_name,
            email: member.Users.email,
          },
        })),
        expenses: group.Expenses.map((expense) => ({
          id: expense.id,
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
          createdAt: expense.createdAt,
          category: {
            id: expense.Categories.id,
            name: expense.Categories.name,
          },
          user: {
            id: expense.Users.id,
            fullName: expense.Users.full_name,
            email: expense.Users.email,
          },
        })),
        totalExpenses: group.Expenses.reduce((sum, exp) => sum + exp.amount, 0),
        memberCount: group.GroupMembers.length,
      }));

      return {
        success: true,
        groups: transformedGroups,
      };
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return {
        success: false,
        message: 'Failed to fetch groups',
      };
    }
}

// Get a specific group by ID
async function getGroupById(groupId, userId) {
  try {
    const group = await prisma.groups.findUnique({
      where: { id: groupId },
      include: {
        Users: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
          GroupMembers: {
            include: {
              Users: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                },
              },
            },
          },
          Expenses: {
            include: {
              Categories: true,
              Users: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              date: 'desc',
            },
          },
        },
      });

      if (!group) {
        return {
          success: false,
          message: 'Group not found',
        };
      }

      // Check if user is a member or creator
      const isMember = group.GroupMembers.some((member) => member.userId === userId);
      const isCreator = group.createdBy === userId;

      if (!isMember && !isCreator) {
        return {
          success: false,
          message: 'You do not have access to this group',
        };
      }

      // Transform the data
      const transformedGroup = {
        id: group.id,
        name: group.name,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        creator: {
          id: group.Users.id,
          fullName: group.Users.full_name,
          email: group.Users.email,
        },
        members: group.GroupMembers.map((member) => ({
          id: member.id,
          role: member.role,
          joinedAt: member.joinedAt,
          user: {
            id: member.Users.id,
            fullName: member.Users.full_name,
            email: member.Users.email,
          },
        })),
        expenses: group.Expenses.map((expense) => ({
          id: expense.id,
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
          createdAt: expense.createdAt,
          category: {
            id: expense.Categories.id,
            name: expense.Categories.name,
          },
          user: {
            id: expense.Users.id,
            fullName: expense.Users.full_name,
            email: expense.Users.email,
          },
        })),
        totalExpenses: group.Expenses.reduce((sum, exp) => sum + exp.amount, 0),
        memberCount: group.GroupMembers.length,
      };

      return {
        success: true,
        group: transformedGroup,
      };
    } catch (error) {
      console.error('Error fetching group:', error);
      return {
        success: false,
        message: 'Failed to fetch group',
      };
    }
}

// Update group details
async function updateGroup(groupId, userId, updateData) {
  try {
      // Check if user is the creator or an admin
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: {
          GroupMembers: true,
        },
      });

      if (!group) {
        return {
          success: false,
          message: 'Group not found',
        };
      }

      const isCreator = group.createdBy === userId;
      const member = group.GroupMembers.find((m) => m.userId === userId);
      const isAdmin = member?.role === 'admin';

      if (!isCreator && !isAdmin) {
        return {
          success: false,
          message: 'Only group creators and admins can update group details',
        };
      }

      // Update the group
      const updatedGroup = await prisma.groups.update({
        where: { id: groupId },
        data: {
          name: updateData.name,
        },
        include: {
          Users: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
          GroupMembers: {
            include: {
              Users: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        group: updatedGroup,
      };
    } catch (error) {
      console.error('Error updating group:', error);
      return {
        success: false,
        message: 'Failed to update group',
      };
    }
}

// Delete a group
async function deleteGroup(groupId, userId) {
  try {
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        return {
          success: false,
          message: 'Group not found',
        };
      }

      // Only the creator can delete the group
      if (group.createdBy !== userId) {
        return {
          success: false,
          message: 'Only the group creator can delete the group',
        };
      }

      // Delete all group members and expenses first (cascade)
      await prisma.groupMembers.deleteMany({
        where: { groupId: groupId },
      });

      // Update expenses to remove group association instead of deleting
      await prisma.expenses.updateMany({
        where: { groupId: groupId },
        data: { groupId: null },
      });

      // Delete the group
      await prisma.groups.delete({
        where: { id: groupId },
      });

      return {
        success: true,
        message: 'Group deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting group:', error);
      return {
        success: false,
        message: 'Failed to delete group',
      };
    }
}

// Add a member to a group
async function addGroupMember(groupId, userId, memberData) {
  try {
      const { email, role = 'member' } = memberData;

      // Check if user is the creator or an admin
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: {
          GroupMembers: true,
        },
      });

      if (!group) {
        return {
          success: false,
          message: 'Group not found',
        };
      }

      const isCreator = group.createdBy === userId;
      const member = group.GroupMembers.find((m) => m.userId === userId);
      const isAdmin = member?.role === 'admin';

      if (!isCreator && !isAdmin) {
        return {
          success: false,
          message: 'Only group creators and admins can add members',
        };
      }

      // Find the user to add by email
      const userToAdd = await prisma.users.findUnique({
        where: { email: email },
      });

      if (!userToAdd) {
        return {
          success: false,
          message: 'User with this email not found',
        };
      }

      // Check if user is already a member
      const existingMember = group.GroupMembers.find((m) => m.userId === userToAdd.id);
      if (existingMember) {
        return {
          success: false,
          message: 'User is already a member of this group',
        };
      }

      // Add the member
      const newMember = await prisma.groupMembers.create({
        data: {
          groupId: groupId,
          userId: userToAdd.id,
          role: role,
        },
        include: {
          Users: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        member: {
          id: newMember.id,
          role: newMember.role,
          joinedAt: newMember.joinedAt,
          user: {
            id: newMember.Users.id,
            fullName: newMember.Users.full_name,
            email: newMember.Users.email,
          },
        },
      };
    } catch (error) {
      console.error('Error adding group member:', error);
      return {
        success: false,
        message: 'Failed to add member to group',
      };
    }
}

// Remove a member from a group
async function removeGroupMember(groupId, userId, memberId) {
  try {
      // Check if user is the creator or an admin
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: {
          GroupMembers: true,
        },
      });

      if (!group) {
        return {
          success: false,
          message: 'Group not found',
        };
      }

      const isCreator = group.createdBy === userId;
      const member = group.GroupMembers.find((m) => m.userId === userId);
      const isAdmin = member?.role === 'admin';

      if (!isCreator && !isAdmin) {
        return {
          success: false,
          message: 'Only group creators and admins can remove members',
        };
      }

      // Find the member to remove
      const memberToRemove = group.GroupMembers.find((m) => m.id === memberId);

      if (!memberToRemove) {
        return {
          success: false,
          message: 'Member not found in this group',
        };
      }

      // Don't allow removing the creator
      if (memberToRemove.userId === group.createdBy) {
        return {
          success: false,
          message: 'Cannot remove the group creator',
        };
      }

      // Remove the member
      await prisma.groupMembers.delete({
        where: { id: memberId },
      });

      return {
        success: true,
        message: 'Member removed successfully',
      };
    } catch (error) {
      console.error('Error removing group member:', error);
      return {
        success: false,
        message: 'Failed to remove member',
      };
    }
}

module.exports = {
  createGroup,
  getUserGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
};
