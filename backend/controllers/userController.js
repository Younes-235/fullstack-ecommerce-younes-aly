const prisma = require('../config/db.js');
const bcrypt = require('bcryptjs');

exports.getUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server configuration error.' });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = req.user.id;

        if (email) {
            const emailExists = await prisma.user.findFirst({
                where: {
                    email: email,
                    NOT: { id: userId } 
                }
            });

            if (emailExists) {
                return res.status(400).json({ error: 'This email address is already in use.' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        res.status(200).json({
            message: 'Profile updated successfully!',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update database profile criteria.' });
    }
};