// src/controllers/economic-parameters.controller.js

const EconomicParameter  = require('../models/EconomicParameters.js');
const mongoose = require('mongoose');
const Plot = require('../models/plotModel');

exports.calculateParameters = async (req, res) => {
  console.log('>> calculateParameters called');
  console.log('Request body:', req.body);

  try {
    const {
      treatmentCost,
      soybeanValue,
      treatmentEfficiency,
      soyState,
      percentageForUDE,
      rowSpacing,
      plotID
    } = req.body;

    if (
      treatmentCost == undefined ||
      soybeanValue == undefined ||
      treatmentEfficiency == undefined ||
      soyState == undefined ||
      percentageForUDE == undefined ||
      rowSpacing == undefined ||
      plotID == undefined
    ) {
      console.log('Missing or invalid input data');
      return res.status(400).json({ message: 'Datos faltantes o inválidos' });
    }
      //validamos que el lote sea valido.
    if (!mongoose.Types.ObjectId.isValid(plotID)) {
      return res.status(400).json({ message: 'plotID inválido' });
    }
    const plot = await Plot.findOne({ _id: plotID, user: req.user.id });
    if (!plot) {
      return res.status(404).json({ message: 'Lote no encontrado o sin permiso' });
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

    let nde = treatmentCost / ((soybeanValue / 1000) * pestFactor * treatmentEfficiency);
    let ude = nde * (percentageForUDE / 100);

    const rowSpacingMeters = rowSpacing / 100;
    const linearMeters = 10000 / rowSpacingMeters;
    nde = nde / linearMeters;
    ude = ude / linearMeters;

    console.log('Computed NDE:', nde.toFixed(2), 'Computed UDE:', ude.toFixed(2));

    const newCalc = await EconomicParameter.create({
      user: req.user.id,
      plotID,
      treatmentCost,
      soybeanValue,
      treatmentEfficiency,
      soyState,
      percentageForUDE,
      rowSpacing,
      nde: parseFloat(nde.toFixed(2)),
      ude: parseFloat(ude.toFixed(2))
    });

    console.log('New calculation saved with ID:', newCalc._id);

    return res.status(201).json({
      id: newCalc._id,
      plotID,
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
    console.error('Error in calculateParameters:', error);
    return res.status(500).json({ message: 'Error al calcular y guardar los parámetros' });
  }
};

exports.updateParameters = async (req, res) => {
  console.log('>> updateParameters called');
  console.log('Params:', req.params, 'Body:', req.body);

  try {
    const { id } = req.params;
    const {
      plotID,
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
      rowSpacing == undefined ||
      plotID == undefined
    ) {
      console.log('Missing data for update');
      return res.status(400).json({ message: 'Faltan datos para actualizar el cálculo' });
    }

    //validamos que el lote sea valido.
    if (!mongoose.Types.ObjectId.isValid(plotID)) {
      return res.status(400).json({ message: 'plotID inválido' });
    }
    const plot = await Plot.findOne({ _id: plotID, user: req.user.id });
    if (!plot) {
      return res.status(404).json({ message: 'Lote no encontrado o sin permiso' });
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

    console.log('Updated computed NDE:', nde.toFixed(2), 'Updated computed UDE:', ude.toFixed(2));

    const updated = await EconomicParameter.findOneAndUpdate(
      { _id: id, user: req.user.id },
      {
        plotID,
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
      console.log('Update failed: not found or unauthorized');
      return res.status(404).json({ message: 'Cálculo no encontrado o no autorizado' });
    }

    console.log('Calculation updated:', updated._id);
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error in updateParameters:', error);
    return res.status(500).json({ message: 'Error al actualizar los parámetros' });
  }
};

exports.getAllParametersByUser = async (req, res) => {
  console.log('>> getAllParametersByUser called');
  console.log('Authenticated user ID:', req.user.id);

  try {
    const userParameters = await EconomicParameter.find({ user: req.user.id });

    if (!userParameters.length) {
      console.log('No parameters found for user:', req.user.id);
      return res.status(404).json({ message: 'No parameters found for this user' });
    }

    console.log('Found parameters count:', userParameters.length);
    res.status(200).json({
      message: 'User parameters fetched successfully',
      parameters: userParameters
    });
  } catch (error) {
    console.error('Error in getAllParametersByUser:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getParameterById = async (req, res) => {
  console.log('>> getParameterById called');
  console.log('Params:', req.params);

  try {
    const { id } = req.params;
    const parameter = await EconomicParameter.findOne({ _id: id, user: req.user.id });

    if (!parameter) {
      console.log('Parameter not found or unauthorized:', id);
      return res.status(404).json({ message: 'Parámetro no encontrado o no autorizado' });
    }

    console.log('Parameter fetched:', parameter._id);
    return res.status(200).json(parameter);
  } catch (error) {
    console.error('Error in getParameterById:', error);
    return res.status(500).json({ message: 'Error al obtener el parámetro' });
  }
};

exports.deleteParameter = async (req, res) => {
  console.log('>> deleteParameter called');
  console.log('Params:', req.params);

  try {
    const { id } = req.params;
    const deleted = await EconomicParameter.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deleted) {
      console.log('Delete failed: not found or unauthorized:', id);
      return res.status(404).json({ message: 'Parámetro no encontrado o no autorizado para eliminar' });
    }

    console.log('Parameter deleted:', deleted._id);
    return res.status(200).json({ message: 'Parámetro eliminado correctamente' });
  } catch (error) {
    console.error('Error in deleteParameter:', error);
    return res.status(500).json({ message: 'Error al eliminar el parámetro' });
  }
};
