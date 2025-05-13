const EconomicParameter = require('../../models/EconomicParameters.js');

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

    // comprobamos que tenemos todos los datos.
    if (
      treatmentCost == undefined ||
      soybeanValue == undefined ||
      treatmentEfficiency == undefined ||
      soyState == undefined ||
      percentageForUDE == undefined
    ) {
      return res.status(400).json({ message: 'Datos faltantes o invalidos' });
    }

    // Vamos a calcular el factor de plaga.
    const pestConsumption = 110;
    // consumo de la Anticarsia gemmatalis en cm cuadrados

    const IAFInfo = {
      "VC": 0.1,
      "V2": 1.2,
      "V5": 4.8,
      "R1": 6.7,
      "R2": 6.3,
      "R3": 6.0,
      "R4": 6.3,
      "R5": 7,
      "R6": 7,
      "R8": 2.5
    };

    let surface = IAFInfo[soyState];
    surface = surface * 10000 * 10000;
    // multiplica por 10000 para obtener la superficie por hectárea y por 10000 para pasarlo a cm cuadrados.

    const deffoliationPercentage = pestConsumption / surface;
    const pestFactor = deffoliationPercentage * 30;
    let nde = treatmentCost / ((soybeanValue / 1000) * pestFactor * treatmentEfficiency);
    // soybeanValue se divide por 1000 para pasar de $/tn a $/kg

    let ude = nde * (percentageForUDE / 100);
    // esto está calculado en insectos / ha. Los ingenieros agrónomos consumen esta info en metro lineal. Vamos a cambiarlo.

    const rowSpacingMeters = rowSpacing / 100;
    // para pasar de cm a m.
    const linearMeters = 10000 / rowSpacingMeters;
    nde = nde / linearMeters;
    ude = ude / linearMeters;
    console.log("Usuario autenticado:", req.user);

    // Guardamos el resultado en la base de datos
    await EconomicParameter.create({
      user: req.user.id,
      nde: parseFloat(nde.toFixed(2)),
      ude: parseFloat(ude.toFixed(2))
    });

    return res.status(200).json({
      nde: parseFloat(nde.toFixed(2)),
      ude: parseFloat(ude.toFixed(2))
    });

   } catch (error) {
    console.error("❌ Error en calculateParameters:", error);
    return res.status(500).json({ message: 'Error al calcular y guardar los parámetros' });
  }
  
};
