const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../constants/index.js");
const PlotModel = require('../models/plotModel.js');  
const { addMonths } = require('date-fns');


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
    const already = await UserModel.exists({ _id: userId, hasMembership: true })
    if (already) {
      console.info(`ℹ️ El usuario con ID ${userId} ya tiene membresía`);
      return res.status(400).json({
        code: 400,
        message: 'User already has membership',
      });
    }

    // Calcular fecha de expiracion: hoy + 1 mes (ya que son membresias mensuales)
    //Además, cuando se vencen, se autorenuevan por 1 mes (a menos que el usuario decida darse de baja) 
    const expiresAt = addMonths(new Date(), 1);

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        hasMembership:       true,
        membershipExpiresAt: expiresAt,
        autoRenew:           true,
        unsubscribed:        false,
        needsCleanup:        false
      },
      { new: true }
    );

    if (!updatedUser) {
      console.warn(`⚠️ Usuario con ID ${userId} no encontrado en la base de datos`);
      return res.status(404).json({
        code: 404,
        message: 'User not found',
      });
    }

    // Si pudimos activar la membresia, ahora activamos TODOS los lotes del usuario (por ejemplo, si en algun momento tenia una membresia, registro 15 y la dio de baja, solo tenia 8 de esos 15 activos, como ahora esta subscripto, puede tener los 15 activos nuevamente).
    const result = await PlotModel.updateMany(
      { user: userId },
      { $set: { active: true } }
    );
    console.log(`✅ Se activaron ${result.modifiedCount} lote(s) para el usuario ${userId}`);


    console.log(`✅ Membresía activada correctamente para el usuario con ID: ${userId}`);
    return res.status(200).json({
      code: 200,
      message: 'Membership activated and all plots set to active successfully',
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
    const user = await UserModel.findById(userId);
    if (!user || !user.hasMembership) {
      return res.status(400).json({
        code: 400,
        message: 'User doesn’t have any active memberships',
      });
    }

    // 2) Verificamos si ya solicitó la baja
    if (user.unsubscribed) {
      return res.status(400).json({
        code: 400,
        message: 'Membership cancellation already requested, awaiting expiration date.',
      });
    }

    //si no dio error en el paso anterior, el usuario tenia alguna membresia activa, por lo que marcamos que una vez que pase el plazo que había pagado, no se renovará,
     // Marcamos que NO renueve y que está en período post-subscripción
    const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          autoRenew:    false,
          unsubscribed: true
          // NOTA: dejamos hasMembership a true hasta que expire (de esto se ocupa el servicio que corre periodicamente)
        },
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

    console.log(`✅ solicitud de desactivación de membresia registrada correctamente para el usuario con ID: ${userId}`);
    return res.status(200).json({
      code: 200,
      message: 'Membership deactivation request processed successfully',
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
