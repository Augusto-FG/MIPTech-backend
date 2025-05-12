exports.calculateParameters = (req, res) => {
  const {
    treatmentCost,
    soybeanValue,
    treatmentEfficiency,
    soyState,
    percentageForUDE,
    rowSpacing
  } = req.body;

  // comprobamos que tenemos todos los datos.
  if (treatmentCost == undefined || soybeanValue == undefined || treatmentEfficiency==undefined || soyState == undefined || percentageForUDE == undefined) {
    return res.status(400).json({ message: 'Datos faltantes o invalidos' });
  }
  //despues ver con Ro en qué unidades me está pasando todo para adaptar!!

  // Vamos a calcular el factor de plaga.
  const pestConsumption = 120
  //consumo de la Anticarsia gemmatalis en cm cuadrados
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
}
  let surface = IAFInfo[soyState];
  surface = surface * 10000 * 10000;
//multiplica por 10000 para obtener la superficie por hectárea y por 1000 para pasarlo a cm cuadrados.
  const deffoliationPercentage = pestConsumption/surface;
  const pestFactor = deffoliationPercentage * 24.8;
  let nde = treatmentCost / (soybeanValue * pestFactor * treatmentEfficiency);
  let ude = nde * (percentageForUDE/100);
  //esto esta calculado en insectos / ha. Los ingenieros agrónomos consumen esta info en metro lineal. Vamos a cambiarlo. 
  rowSpacingMeters = rowSpacing/100;
//para pasar de cm a m
  const linearMeters = 10000/rowSpacingMeters;
  nde = nde / linearMeters;
  ude = ude / linearMeters;
  
  
  
  return res.status(200).json({
    nde: parseFloat(nde.toFixed(2)),
    ude: parseFloat(ude.toFixed(2))
  });
};

