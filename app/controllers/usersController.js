const User = require('../models/user.js');

const usersController = {
  /**
   * Get all users function
   */
  getAllUsers: async (_req, res) => {
    console.log("je lance la route get all users")
    try {
      const users = await User.aggregate([
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
      ]);

      if ((users.length > 0) && (!res.headersSent)) {
        console.log('Users retrieved successfully');
        res.status(200).json(users);
      } else {
        res.status(404).json({ error: 'No users found.' });
      }
    } catch (error) {
      if (!res.headersSent) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Failed to get users.' });
      }
    }
  },

}

module.exports = usersController
