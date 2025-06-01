const cron = require('node-cron');
const { addMonths } = require('date-fns');
const UserModel   = require('../models/userModel');
const PlotModel   = require('../models/plotModel');

module.exports = function scheduleMembershipJobs() {
  // Corre al levantar el servidor
  runMembershipChecks();

  // Despues sigue corriendo  cada 2 minutos
  cron.schedule('*/2 * * * *', runMembershipChecks);
};


async function runMembershipChecks() {
    const now = new Date();

    console.log(`⏰ Cron ejecutándose a las ${new Date().toLocaleTimeString()}`);
    // Renovación automática de quienes siguen suscritos

    const toRenew = await UserModel.find({
        hasMembership:        true,
        unsubscribed:         false,
        membershipExpiresAt: { $exists: true, $lte: now }
    });

    for (const user of toRenew) {
        try {
            //se les añade un mes de membresia ya que estaban para autorenovacion
            user.membershipExpiresAt = addMonths(user.membershipExpiresAt, 1);
            await user.save();
        } catch (err) {
            console.error('Error renewing user', user._id, err);
        }
    } 

    //  Expiración de quienes pidieron baja y aún no llegado su fecha
    const toExpire = await UserModel.find({
        hasMembership:        true,
        unsubscribed:         true,
        membershipExpiresAt: { $exists: true, $lte: now },
        needsCleanup:        false
    });

    for (const user of toExpire) {
        try {
            // Lo pasamos a plan free
            user.hasMembership = false;

            // Si tiene >8 plots activos, marcamos needsCleanup
            const activeCount = await PlotModel.countDocuments({ user: user._id, active: true });
            if (activeCount > 8) {
                user.needsCleanup = true;
            }

            await user.save();
        } catch (err) {
            console.error('Error expiring user', user._id, err);
        }
    } 

const toClean = await UserModel.find({ needsCleanup: true });
  for (const user of toClean) {
    try {
      const activeCount = await PlotModel.countDocuments({ user: user._id, active: true });
      if (activeCount <= 8) {
        // Quitamos el flag
        user.needsCleanup = false;

        await user.save();
        console.log(`  ✅ needsCleanup removido para user:${user._id} (ahora ${activeCount} plots activos)`);
      }
    } catch (err) {
      console.error('Error limpiando needsCleanup para user', user._id, err);
    }
  }

} 
