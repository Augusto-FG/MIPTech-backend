// src/controllers/economic-parameters.controller.js

const EconomicParameter = require("../models/EconomicParameters.js");
const mongoose = require("mongoose");
const Plot = require("../models/plotModel");

exports.calculateParameters = async (req, res) => {
    console.log(">> calculateParameters called");
    console.log("Request body:", req.body);

    try {
        const {
            treatmentCost,
            soybeanValue,
            treatmentEfficiency,
            soyState,
            percentageForUDE,
            rowSpacing,
            plotID,
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
            console.log("Missing or invalid input data");
            return res.status(400).json({ message: "Missing or invalid data" });
        }

        if (!mongoose.Types.ObjectId.isValid(plotID)) {
            return res.status(400).json({ message: "Invalid plotID" });
        }

        const plot = await Plot.findOne({ _id: plotID, user: req.user.id });
        if (!plot) {
            return res
                .status(404)
                .json({ message: "Plot not found or unauthorized" });
        }
        if (!plot.active) {
            return res.status(403).json({
                message: "Cannot calculate parameters for an inactive plot",
            });
        }

        const pestConsumption = 110; // cm²
        const IAFInfo = {
            VC: 0.1,
            V2: 1.2,
            V5: 4.8,
            R1: 6.7,
            R2: 6.3,
            R3: 6.0,
            R4: 6.3,
            R5: 7,
            R6: 7,
            R8: 2.5,
        };

        let surface = IAFInfo[soyState] * 10000 * 10000;
        const defoliationPercentage = pestConsumption / surface;
        const pestFactor = defoliationPercentage * 30;

        let nde =
            treatmentCost /
            ((soybeanValue / 1000) * pestFactor * treatmentEfficiency);
        let ude = nde * (percentageForUDE / 100);

        const rowSpacingMeters = rowSpacing / 100;
        const linearMeters = 10000 / rowSpacingMeters;
        nde = nde / linearMeters;
        ude = ude / linearMeters;

        console.log("Computed NDE:", nde.toFixed(2), "UDE:", ude.toFixed(2));

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
            ude: parseFloat(ude.toFixed(2)),
        });

        console.log("New calculation saved with ID:", newCalc._id);

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
            ude: newCalc.ude,
        });
    } catch (error) {
        console.error("Error in calculateParameters:", error);
        return res
            .status(500)
            .json({ message: "Failed to calculate and save parameters" });
    }
};

exports.updateParameters = async (req, res) => {
    console.log(">> updateParameters called");
    console.log("Params:", req.params, "Body:", req.body);

    try {
        const { id } = req.params;
        const {
            plotID,
            treatmentCost,
            soybeanValue,
            treatmentEfficiency,
            soyState,
            percentageForUDE,
            rowSpacing,
        } = req.body;

        if (
            treatmentCost == undefined ||
            soybeanValue == undefined ||
            treatmentEfficiency == undefined ||
            soyState == undefined ||
            percentageForUDE == undefined ||
            rowSpacing == undefined
        ) {
            console.log("Missing data for update");
            return res
                .status(400)
                .json({ message: "Missing data to update calculation" });
        }

        const existing = await EconomicParameter.findOne({
            _id: id,
            user: req.user.id,
        });
        if (!existing) {
            console.log("Update failed: not found or unauthorized");
            return res
                .status(404)
                .json({ message: "Calculation not found or unauthorized" });
        }

        //Determinamos el plotID a usar:
        // si enviaron uno en el body, lo validamos y usamos
        // si no lo enviaron, ponemos el que ya tenía
        let newPlotID = existing.plotID;
        if (plotID !== undefined) {
            // Si vino plotID, validamos que sea valido y que pertenezca al user
            if (!mongoose.Types.ObjectId.isValid(plotID)) {
                return res.status(400).json({ message: "Invalid plotID" });
            }
            const plot = await Plot.findOne({ _id: plotID, user: req.user.id });
            if (!plot) {
                return res
                    .status(404)
                    .json({ message: "Plot not found or unauthorized" });
            }
            if (!plot.active) {
                return res.status(403).json({
                    message: "Cannot update parameters of an inactive plot",
                });
            }
            newPlotID = plotID;
        } else {
            // Si no vino, nos quedamos con el que ya estaba
            const plot = await Plot.findOne({
                _id: existing.plotID,
                user: req.user.id,
            });
            if (!plot) {
                // Si por alguna razón el plot original ya no existe o no pertenece al user:
                return res
                    .status(400)
                    .json({ message: "Original plot is no longer available" });
            }
            if (!plot.active) {
                return res.status(403).json({
                    message:
                        "Cannot update parameters: associated plot is inactive",
                });
            }
        }

        const pestConsumption = 110;
        const IAFInfo = {
            VC: 0.1,
            V2: 1.2,
            V5: 4.8,
            R1: 6.7,
            R2: 6.3,
            R3: 6.0,
            R4: 6.3,
            R5: 7,
            R6: 7,
            R8: 2.5,
        };

        let surface = IAFInfo[soyState] * 10000 * 10000;
        const defoliationPercentage = pestConsumption / surface;
        const pestFactor = defoliationPercentage * 30;

        let nde =
            treatmentCost /
            ((soybeanValue / 1000) * pestFactor * treatmentEfficiency);
        let ude = nde * (percentageForUDE / 100);

        const rowSpacingMeters = rowSpacing / 100;
        const linearMeters = 10000 / rowSpacingMeters;
        nde = nde / linearMeters;
        ude = ude / linearMeters;

        console.log("Updated NDE:", nde.toFixed(2), "UDE:", ude.toFixed(2));

        const updatePayload = {
            plotID: newPlotID,
            treatmentCost,
            soybeanValue,
            treatmentEfficiency,
            soyState,
            percentageForUDE,
            rowSpacing,
            nde: parseFloat(nde.toFixed(2)),
            ude: parseFloat(ude.toFixed(2)),
        };
        if (req.body.createdAt && !isNaN(Date.parse(req.body.createdAt))) {
            updatePayload.createdAt = new Date(req.body.createdAt);
        }

        const updated = await EconomicParameter.findOneAndUpdate(
            { _id: id, user: req.user.id },
            updatePayload,
            { new: true, timestamps: false }
        );

        if (!updated) {
            console.log("Update failed: not found or unauthorized");
            return res
                .status(404)
                .json({ message: "Calculation not found or unauthorized" });
        }

        console.log("Calculation updated:", updated._id);
        return res.status(200).json(updated);
    } catch (error) {
        console.error("Error in updateParameters:", error);
        return res.status(500).json({ message: "Failed to update parameters" });
    }
};

exports.deleteParameter = async (req, res) => {
    console.log(">> deleteParameter called");
    console.log("Params:", req.params);

    try {
        const { id } = req.params;
        const parameter = await EconomicParameter.findOne({
            _id: id,
            user: req.user.id,
        });

        if (!parameter) {
            console.log("Delete failed: parameter not found or unauthorized");
            return res.status(404).json({
                message: "Parameter not found or unauthorized to delete",
            });
        }

        const plot = await Plot.findOne({
            _id: parameter.plotID,
            user: req.user.id,
        });
        if (!plot) {
            return res
                .status(404)
                .json({ message: "Associated plot not found" });
        }
        if (!plot.active) {
            return res.status(403).json({
                message: "Cannot delete parameters of an inactive plot",
            });
        }

        await parameter.deleteOne();
        console.log("Parameter deleted:", parameter._id);
        return res
            .status(200)
            .json({ message: "Parameter deleted successfully" });
    } catch (error) {
        console.error("Error in deleteParameter:", error);
        return res.status(500).json({ message: "Failed to delete parameter" });
    }
};

exports.getAllParametersByUser = async (req, res) => {
    console.log(">> getAllParametersByUser called");
    console.log("Authenticated user ID:", req.user.id);

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        const totalCount = await EconomicParameter.countDocuments({
            user: req.user.id,
        });

        if (totalCount === 0) {
            console.log("No parameters found for user:", req.user.id);
            return res
                .status(404)
                .json({ message: "No parameters found for this user" });
        }

        const totalPages = Math.ceil(totalCount / limit);
        if (page > totalPages || page < 1) {
            return res.status(400).json({
                message: `Page ${page} out of range. Total pages: ${totalPages}`,
            });
        }

        const userParameters = await EconomicParameter.find({
            user: req.user.id,
        })
            .skip(skip)
            .limit(limit);
        console.log(
            "Found parameters for user:",
            req.user.id,
            "Count:",
            userParameters.length
        );

        return res.status(200).json({
            message: "User parameters fetched successfully",
            current_page: page,
            total_pages: totalPages,
            total_count: totalCount,
            parameters: userParameters,
        });
    } catch (error) {
        console.error("Error in getAllParametersByUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getParameterById = async (req, res) => {
    console.log(">> getParameterById called");
    console.log("Params:", req.params);

    try {
        const { id } = req.params;
        const parameter = await EconomicParameter.findOne({
            _id: id,
            user: req.user.id,
        });

        if (!parameter) {
            console.log("Parameter not found or unauthorized:", id);
            return res
                .status(404)
                .json({ message: "Parameter not found or unauthorized" });
        }

        console.log("Parameter fetched:", parameter._id);
        return res.status(200).json(parameter);
    } catch (error) {
        console.error("Error in getParameterById:", error);
        return res.status(500).json({ message: "Failed to fetch parameter" });
    }
};

exports.getParametersByPlotId = async (req, res) => {
  console.log('>> getAllParametersByPlotId called');
  console.log('Params:', req.params);

  try {
    const { id } = req.params;

    if (req.query.page) {
      const page = parseInt(req.query.page) || 1;
      const limit = 4;                                     
      const skip = (page - 1) * limit;    

      const totalCount = await EconomicParameter.countDocuments({ plotID: id });

      if (totalCount===0) {
        console.log('No parameters found for plot:', req.user.id);
        return res.status(404).json({ message: 'No parameters found for this plot' });
      }

      const totalPages = Math.ceil(totalCount / limit);
      if (page > totalPages || page < 1) {
        return res.status(400).json({
          message: `Page ${page} out of range. Total pages: ${totalPages}`
        });
      }

      const parameters = await EconomicParameter.find({ plotID: id }).skip(skip).limit(limit);
      console.log('Found parameters for plot:', id, 'Count:', parameters.length);


      return res.status(200).json({
        parameters,
        pagination: {
          total: totalCount,
          page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } else {

      const parameters = await EconomicParameter.find({ plotID: id });
      console.log('Found parameters for plot:', id, 'Count:', parameters.length);

      return res.status(200).json({ parameters });
    }
  } catch (error) {
    console.error('Error in getAllParametersByPlotId:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
