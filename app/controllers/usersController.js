const User = require('../models/user.js');
const Technology = require('../models/technology.js');
const Specialization = require('../models/specialization.js');
const Match = require('../models/match.js');
const bcrypt = require('bcrypt');
const validationDataForm = require('../utils/validationDataForm');
// import lookup pipeline to agregate specialization and technology collections to users
const speTechnoLookup = require('../utils/speTechnoLookup')


let lastUserId = null;

const usersController = {
  /** Get all users function */
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
      res.status(500).json({ error: 'Failed to get all users.' });
    }
  },

  // Here the function allow us to retrieve one user by their specialization
  getOneUserBySpecilization: async (req, res) => {
    try {
      const specialization = req.params.slug;
      const sessionUser = req.user._id;
      const matches = await Match.find({ $or: [{ user1_id: sessionUser }, { user2_id: sessionUser }], accepted: true }).select('user1_id user2_id -_id');
      const matchUserIds = matches.flatMap(match => [match.user1_id, match.user2_id]);
      const users = await User.aggregate([
        ...speTechnoLookup,
        {
          $match: {
            // On filtrer par spécialisation
            "specialization.slug": specialization,
            // On exclut l'utilisateur connecté
            _id: { $ne: sessionUser },
            // On exclut les utilisateurs avec qui l'utilisateur connecté a déjà un match
            // validé & le dernier utilisateur affiché dans la recherche.
            $nor: [
              { _id: { $in: matchUserIds } },
              { $and: [{ _id: { $ne: sessionUser } }, { _id: lastUserId }] }
            ]
          }
        },
        { $sample: { size: 1 } } // get a single random document
      ]);

      if (users.length === 0) {
        res.status(404).json({ error: 'No users found.' });
      } else {
        // Returns the first (and single) document in the array
        lastUserId = users[0]._id;
        res.status(200).json(users[0]);
      }
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get user by specialization.' });
    }
  },

  // Todo : getOneUserByID

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

      // AbortEarly is a option that specifies to stop when he encounter the first error.
      // By default its set to true. If you set to false, the validation will continue and
      // return all errors.

      const { error } = validationDataForm.validate(req.body, { abortEarly: false });
      console.log('error', error);
      if (error) {
        return res.status(400).json({ message: error.details });
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
