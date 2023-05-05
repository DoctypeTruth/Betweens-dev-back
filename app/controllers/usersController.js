const User = require('../models/user.js');
const Technology = require('../models/technology.js');
const Specialization = require('../models/specialization.js');
const bcrypt = require('bcrypt');
// import lookup pipeline to agregate specialization and technology collections to users
const speTechnoLookup = require('../utils/speTechnoLookup')

const usersController = {
  /**
   * Get all users function
   */
  getAllUsers: async (_req, res) => {
    console.log("je lance la route get all users")
    try {
      // The aggregate operation allow to process data operations on one a or multiple
      // collection
      const users = await User.aggregate(speTechnoLookup);

      if (users.length > 0) {
        console.log('Users retrieved successfully');
        res.status(200).json(users);
      } else {
        res.status(404).json({ error: 'No users found.' });
      }
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get users.' });
    }
  },

  // Here the function allow us to retrieve users by their specialization
  getUsersBySpecilization: async (req, res) => {
    try {
      const specialization = req.params.specialization
      // $match allow to filter with aggregate 
      const users = await User.aggregate([...speTechnoLookup, { $match: { "specialization.name": specialization } }]);

      if (users.length === 0) {
        res.status(404).json({ error: 'No users found.' });
      } else {
        res.status(200).json(users);
      }
    }
    catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get users.' });
    }
  },

  createUser: async (req, res) => {
    try {
      const { pseudo, email, city, picture, password, description, status, level, goals, technology, specialization } = req.body;

      console.log("req.body", req.body)

      // Check if the username or email already exist
      let user = await User.findOne({ $or: [{ pseudo }, { email }] });
      if (user) {
        return res.status(400).json({ message: 'Username or email already exist' });
      }

      const technologyInfos = await Technology.findOne({ name: technology });
      const specializationInfos = await Specialization.findOne({ name: specialization });


      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create a new user
      user = new User({
        pseudo,
        email,
        city,
        picture,
        password: hashedPassword,
        description,
        status,
        level,
        goals,
        technology: {
          _id: technologyInfos._id,
        },
        specialization: {
          _id: specializationInfos._id,
        }
      });

      await user.save();
      res.status(201).json({ message: "user created", user });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error when creating the user' });
    }
  },


}

module.exports = usersController
