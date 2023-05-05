const speTechnoLookup = [
  {
    // $lookup joint collection.
    $lookup: {
      from: 'specialization',
      localField: 'specialization._id',
      foreignField: '_id',
      as: 'specialization'
    }
  },
  {
    // By default it will retrieve in array, unwind remove it.
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
