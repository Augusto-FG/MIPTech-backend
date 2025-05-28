const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../constants/index.js");

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

exports.getUserProfile = async (req, res) => {
  try {
    // Verificamos si el middleware de autenticación agregó el ID del usuario
    const userId = req.user?.id;

    if (!userId) {
      console.warn("🚫 Acceso no autorizado. Falta autenticación.");
      return res.status(401).json({
        code: 401,
        message: "Unauthorized. This service requires authentication and does not accept user ID by parameter.",
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      console.warn(`⚠️ Usuario con ID ${userId} no encontrado`);
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    console.log(`✅ Usuario autenticado con ID ${userId} obtenido exitosamente`);
    return res.status(200).json({
      code: 200,
      message: 'User retrieved successfully',
      user,
    });

  } catch (error) {
    console.error('❌ Error al obtener el usuario autenticado:', error);
    return res.status(500).json({
      code: 500,
      message: 'Server error while retrieving the user',
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  // Usamos el ID del token (req.user.id) y no params
  const userId = req.user?.id;
  const { email, name, lastname } = req.body;

  if (!userId) {
    console.log('🚫 Falta autenticación: no se encontró el ID del usuario en el token');
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized: Authentication token is missing or invalid',
    });
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { email, name, lastname },
      { new: true }
    );

    if (!updatedUser) {
      console.warn(`⚠️ Usuario con ID ${userId} no encontrado`);
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    console.log(`✅ Usuario con ID ${userId} actualizado exitosamente`);
    return res.status(200).json({
      code: 200,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('❌ Error al actualizar el usuario:', error);
    return res.status(500).json({
      code: 500,
      message: 'Server error while updating the user',
    });
  }
};

// Activar membresía
exports.activateMembership = async (req, res) => {
  const userId = req.user?.id;

  console.log('🔐 Intentando activar la membresía para el usuario...');

  if (!userId) {
    console.warn('🚫 Token inválido o faltante: no se encontró el ID del usuario');
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized: User ID not found in token',
    });
  }

  try {
    //unicamente activamos la membresia en los casos en los que no tenga membresia.
    const already = await UserModel.exists({ _id: userId, hasMembership: true });
    if (already) {
      console.info(`ℹ️ El usuario con ID ${userId} ya tiene membresía`);
      return res.status(400).json({
        code: 400,
        message: 'User already has membership',
      });
    }
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { hasMembership: true },
      { new: true }
      //new: true sirve para que devuelva el doc actualizado y no el viejo.
    );

    if (!updatedUser) {
      console.warn(`⚠️ Usuario con ID ${userId} no encontrado en la base de datos`);
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    console.log(`✅ Membresía activada correctamente para el usuario con ID: ${userId}`);
    return res.status(200).json({
      code: 200,
      message: 'Membership activated successfully',
      user: updatedUser,
    });

  } catch (error) {
    console.error(`❌ Error al activar la membresía para el usuario con ID ${userId}:`, error);
    return res.status(500).json({
      code: 500,
      message: 'Server error while activating membership',
    });
  }
};

exports.deactivateMembership = async (req, res) => {
  const userId = req.user?.id;

  console.log('🔐 Intentando desactivar la membresía para el usuario...');
  
  //usa el middleware para validar
  if (!userId) {
    console.warn('🚫 Token inválido o faltante: no se encontró el ID del usuario');
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized: User ID not found in token',
    });
  }

  try {
    //validamos que tenga membresia activa que dar de baja.
    const already = await UserModel.exists({ _id: userId, hasMembership: true });
    if (!already) {
      console.info(`ℹ️ El usuario con ID ${userId} no tenía ninguna membresía activa`);
      return res.status(400).json({
        code: 400,
        message: 'User doesnt have any active memberships',
      });
    }
    //si no dio error en el paso anterior, el usuario tenia alguna membresia activa, por lo que la desactivamos,
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { hasMembership: false },
      { new: true }
    );
    //si dio error, lo devolvemos
    if (!updatedUser) {
      console.warn(`⚠️ Usuario con ID ${userId} no encontrado en la base de datos`);
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    console.log(`✅ Membresía desactivada correctamente para el usuario con ID: ${userId}`);
    return res.status(200).json({
      code: 200,
      message: 'Membership deactivated successfully',
      user: updatedUser,
    });

  } catch (error) {
    console.error(`❌ Error al desactivar la membresía para el usuario con ID ${userId}:`, error);
    return res.status(500).json({
      code: 500,
      message: 'Server error while deactivating membership',
    });
  }
};