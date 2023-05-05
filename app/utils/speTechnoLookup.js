const speTechnoLookup = [
  {
    $lookup: {
      from: 'specialization',
      localField: 'specialization._id',
      foreignField: '_id',
      as: 'specialization'
    }
  },
  {
    $unwind: '$specialization'
  },
  {
    $lookup: {
      from: 'technology',
      localField: 'technology._id',
      foreignField: '_id',
      as: 'technology'
    }
  },

];

module.exports = speTechnoLookup;
