const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../constans/index.js");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    console.log('Fetched all users successfully');
    return res.status(200).json({
      code: 200,
      message: 'Users retrieved successfully',
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      code: 500,
      message: 'Server error while retrieving users',
    });
  }
};

exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }
    console.log(`Fetched user with ID ${userId} successfully`);
    return res.status(200).json({
      code: 200,
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      code: 500,
      message: 'Server error while retrieving the user',
    });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { email, name, surname, username, gender, role } = req.body;

  if (!req.user || req.user.id !== userId) {
    console.log('User is not authorized to modify this account');
    return res.status(403).json({
      code: 403,
      message: 'Forbidden: You are not authorized to update this user',
    });
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { email, name, surname, username, gender, role },
      { new: true }
    );

    if (!updatedUser) {
      console.log(`User with ID ${userId} not found for update`);
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    console.log(`User with ID ${userId} updated successfully`);
    return res.status(200).json({
      code: 200,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      code: 500,
      message: 'Server error while updating the user',
    });
  }
};
