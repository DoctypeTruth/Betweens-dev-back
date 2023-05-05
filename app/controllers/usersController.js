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
      const specialization = req.params.slug
      // $match allow to filter with aggregate 
      const users = await User.aggregate([...speTechnoLookup, { $match: { "specialization.slug": specialization } }]);

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


      // if (req.params.id) {
      //   console.log("udpdate mode")
      //   return;
      // }

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

      const userData = {
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
      }

      // Create a new user
      user = new User(userData);

      await user.save();
      res.status(201).json({ message: "user created", user });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error when creating the user' });
    }
  },

  updateUser: async (req, res) => {

    const { pseudo, email, city, picture, password, description, status, level, goals, technology, specialization } = req.body;
    // Todo : Add input value test

    try {
      const userId = req.params.id;
      const updateData = {
        pseudo,
        email,
        city,
        picture,
        // password: hashedPassword,
        description,
        status,
        level,
        goals,
        // technology: {
        //   _id: technologyInfos._id,
        // },
        // specialization: {
        //   _id: specializationInfos._id,
        // }
      }
      const updatedUser = await User.findOneAndUpdate({ _id: userId }, { $set: updateData }, { new: true });
      if ((updatedUser) && (!res.headersSent)) {
        console.log('User updated successfully:', updatedUser);
        res.status(200).json(updatedUser);
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    } catch (error) {
      if (!res.headersSent) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user.' });
      }
    }
  },

  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id
      const result = await User.deleteOne({ _id: userId });
      if (result.deletedCount === 1) {
        console.log('User successfully deleted');
        res.status(204).json();
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete the user.' });
    }
  }
}

module.exports = usersController
