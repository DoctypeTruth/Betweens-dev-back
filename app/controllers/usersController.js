const User = require('../models/user.js');
// import lookup pipeline to agregate specialization and technology collections to users
const speTechnoLookup = require('../utils/speTechnoLookup')

const usersController = {
  /**
   * Get all users function
   */
  getAllUsers: async (_req, res) => {
    console.log("je lance la route get all users")
    try {
      // The aggregate operation allow to process data operations on one a or
      // multiple collections
      const users = await User.aggregate(speTechnoLookup);

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
