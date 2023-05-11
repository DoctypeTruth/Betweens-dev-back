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
    // $lookup joint collection.
    $lookup: {
      from: 'specialization',
      localField: 'goals._id',
      foreignField: '_id',
      as: 'goals'
    }
  },
  {
    // By default it will retrieve in array, unwind remove it.
    $unwind: '$goals'
  },
  {
    $lookup: {
      from: 'technology',
      localField: 'technology._id',
      foreignField: '_id',
      as: 'technology'
    }
  },
  {
    $lookup: {
      from: 'match',
      localField: 'match._id',
      foreignField: '_id',
      as: 'match'
    }
  },
];

module.exports = speTechnoLookup;
