const User = require('../models/user.js');

const usersController = {
  /**
   * Get all users function
   */
  getAll: async (_req, res) => {
    console.log("je lance la route get all users")
    try {
      const users = await User.find();
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
  }
}

module.exports = usersController
