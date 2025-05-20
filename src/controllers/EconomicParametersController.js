const EconomicParameters = require('../models/EconomicParameters.js');
const EconomicParameter = require('../models/EconomicParameters.js');

exports.calculateParameters = async (req, res) => {
  try {
    const {
      treatmentCost,
      soybeanValue,
      treatmentEfficiency,
      soyState,
      percentageForUDE,
      rowSpacing
    } = req.body;

    // comprobamos que tenemos todos los datos
    if (
      treatmentCost == undefined ||
      soybeanValue == undefined ||
      treatmentEfficiency == undefined ||
      soyState == undefined ||
      percentageForUDE == undefined ||
      rowSpacing == undefined
    ) {
      return res.status(400).json({ message: 'Datos faltantes o inválidos' });
    }

    // Factor de plaga
    const pestConsumption = 110; // consumo en cm²
    const IAFInfo = {
      VC: 0.1, V2: 1.2, V5: 4.8,
      R1: 6.7, R2: 6.3, R3: 6.0,
      R4: 6.3, R5: 7,   R6: 7,
      R8: 2.5
    };

    let surface = IAFInfo[soyState] * 10000 * 10000; // ha → cm²
    const defoliationPercentage = pestConsumption / surface;
    const pestFactor = defoliationPercentage * 30;

    // soybeanValue: $/tn → $/kg
    let nde = treatmentCost / ((soybeanValue / 1000) * pestFactor * treatmentEfficiency);
    let ude = nde * (percentageForUDE / 100);

    // convertir a metros lineales
    const rowSpacingMeters = rowSpacing / 100;
    const linearMeters = 10000 / rowSpacingMeters;
    nde = nde / linearMeters;
    ude = ude / linearMeters;

    const newCalc = await EconomicParameter.create({
      user: req.user.id,
      treatmentCost,
      soybeanValue,
      treatmentEfficiency,
      soyState,
      percentageForUDE,
      rowSpacing,
      nde: parseFloat(nde.toFixed(2)),
      ude: parseFloat(ude.toFixed(2))
    });

    return res.status(200).json({
      id: newCalc._id,
      treatmentCost: newCalc.treatmentCost,
      soybeanValue: newCalc.soybeanValue,
      treatmentEfficiency: newCalc.treatmentEfficiency,
      soyState: newCalc.soyState,
      percentageForUDE: newCalc.percentageForUDE,
      rowSpacing: newCalc.rowSpacing,
      nde: newCalc.nde,
      ude: newCalc.ude
    });
  } catch (error) {
    console.error('Error en calculateParameters:', error);
    return res.status(500).json({ message: 'Error al calcular y guardar los parámetros' });
  }
};

exports.updateParameters = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      treatmentCost,
      soybeanValue,
      treatmentEfficiency,
      soyState,
      percentageForUDE,
      rowSpacing
    } = req.body;

    if (
      treatmentCost == undefined ||
      soybeanValue == undefined ||
      treatmentEfficiency == undefined ||
      soyState == undefined ||
      percentageForUDE == undefined ||
      rowSpacing == undefined
    ) {
      return res.status(400).json({ message: 'Faltan datos para actualizar el cálculo' });
    }

    const pestConsumption = 110;
    const IAFInfo = {
      VC: 0.1, V2: 1.2, V5: 4.8,
      R1: 6.7, R2: 6.3, R3: 6.0,
      R4: 6.3, R5: 7,   R6: 7,
      R8: 2.5
    };

    let surface = IAFInfo[soyState] * 10000 * 10000;
    const defoliationPercentage = pestConsumption / surface;
    const pestFactor = defoliationPercentage * 30;

    let nde = treatmentCost / ((soybeanValue / 1000) * pestFactor * treatmentEfficiency);
    let ude = nde * (percentageForUDE / 100);

    const rowSpacingMeters = rowSpacing / 100;
    const linearMeters = 10000 / rowSpacingMeters;
    nde = nde / linearMeters;
    ude = ude / linearMeters;

    const updated = await EconomicParameter.findOneAndUpdate(
      { _id: id, user: req.user.id },
      {
        treatmentCost,
        soybeanValue,
        treatmentEfficiency,
        soyState,
        percentageForUDE,
        rowSpacing,
        nde: parseFloat(nde.toFixed(2)),
        ude: parseFloat(ude.toFixed(2))
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Cálculo no encontrado o no autorizado' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error al actualizar parámetro:', error);
    return res.status(500).json({ message: 'Error al actualizar los parámetros' });
  }
};

exports.getAllParametersByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("📥 Solicitando plots del usuario");
    console.log("👤 Usuario autenticado con ID:", userId);

    const userParameters = await EconomicParameters.find({ user: userId });

    if (!userParameters.length) {
      console.warn(`⚠️ No se encontraron parametros calculados para el usuario con ID: ${userId}`);
      return res.status(404).json({ message: "No parameters found for this user" });
    }

    console.log(`✅ Se encontraron ${userParameters.length} plots para el usuario`);

    res.status(200).json({
      message: "User parameters fetched successfully",
      parameters: userParameters
    });
  } catch (error) {
    console.error("❌ Error al obtener los parameters del usuario:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getParameterById = async (req, res) => {
  try {
    const { id } = req.params;
    const parameter = await EconomicParameter.find({ _id: id, user: req.user.id });

    if (!parameter) {
      return res.status(404).json({ message: 'Parámetro no encontrado o no autorizado' });
    }

    return res.status(200).json(parameter);
  } catch (error) {
    console.error('Error al obtener parámetro:', error);
    return res.status(500).json({ message: 'Error al obtener el parámetro' });
  }
};

exports.deleteParameter = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await EconomicParameter.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: 'Parámetro no encontrado o no autorizado para eliminar' });
    }

    return res.status(200).json({ message: 'Parámetro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar parámetro:', error);
    return res.status(500).json({ message: 'Error al eliminar el parámetro' });
  }
};
