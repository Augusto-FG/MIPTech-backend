const SoybeanPest = require('../models/soybeanPest.js');

exports.getSoybeanPests = async (req, res) => {
  try {
const rawPests = await SoybeanPest.find({}, { scientificName: 1, _id: 0 }).lean();
    //para devolverlos con el genero en mayuscula y la especie en minúscula
    //Ejemplo Anticarsia gemmatalis.
    const normalizedPests = rawPests.map(p => {
      const [genus, species] = p.scientificName.trim().split(/\s+/, 2);
      const normalizedName = genus.charAt(0).toUpperCase() + genus.slice(1).toLowerCase() +
                             (species ? ' ' + species.toLowerCase() : '');
      return { scientificName: normalizedName };
    });

    res.status(200).json({
      data: normalizedPests,
    });
  } catch (error) {
    console.error('Error fetching soybean pests:', error);
    res.status(500).json({
      message: 'Error fetching soybean pests',
    });
  }
};
