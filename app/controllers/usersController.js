const User = require('../models/user.js');
const Technology = require('../models/technology.js');
const Specialization = require('../models/specialization.js');
const Match = require('../models/match.js');
const bcrypt = require('bcrypt');
// import lookup pipeline to agregate specialization and technology collections to users
const speTechnoLookup = require('../utils/speTechnoLookup')
const validationDataForm = require('../utils/validationDataForm');

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
      res.status(500).json({ error: 'Failed to get all users.' });
    }
  },

  // Here the function allow us to retrieve one user by their specialization
  getOneUserBySpecilization: async (req, res) => {
    try {
      const specialization = req.params.slug;
      const users = await User.aggregate([
        ...speTechnoLookup,
        { $match: { "specialization.slug": specialization } },
        { $sample: { size: 1 } } // get a single random document
      ]);

      if (users.length === 0) {
        res.status(404).json({ error: 'No users found.' });
      } else {
        // Returns the first (and single) document in the array
        res.status(200).json(users[0]);
      }
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get user by specialization.' });
    }
  },

  // Todo : getOneUserByID

  createMatch: async (req, res) => {
    // const { userId } = req.user; // id de l'utilisateur connecté
    const userId = "78xzpouz1ua8c9n511v1ed"; // Temporairement manuel, sera récupéré dans la session
    const { matchUserId } = req.params; // id de l'utilisateur avec qui on veut matcher

    try {
      // Vérifier si l'utilisateur connecté a déjà matché avec l'utilisateur proposé
      // const existingMatch = await Match.findOne({
      //   $or: [
      //     { user1_id: userId, user2_id: matchUserId },
      //     { user1_id: matchUserId, user2_id: userId }
      //   ]
      // });
      // if (existingMatch) {
      //   return res.status(400).json({ error: "Vous avez déjà matché avec cet utilisateur." });
      // }

      // We check if there is a pending match for the proposed user
      const matchPending = await usersController.checkPendingMatch(userId, matchUserId);
      // If there is a pending match we validate it
      if (matchPending) {
        await Match.findByIdAndUpdate(matchPending._id, { accepted: true });
        // We add the match to the proposed user
        await usersController.addMatchToUser(userId, matchPending._id);
        return res.status(200).json({ message: "C'est un match total, vous pouvez à présent commencer à discuter !" });
      }

      // Else we create a new match
      const match = new Match({
        user1_id: userId,
        user2_id: matchUserId,
        created_at: new Date(),
        accepted: false
      });
      await match.save();
      // We add the match to the user who requested it
      await usersController.addMatchToUser(userId, match._id);
      // We add the match in pending to the proposed user
      await usersController.addPendingMatchToUser(matchUserId, userId, match._id);

      return res.status(200).json({ message: "Match créé avec succès !" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erreur serveur lors de la création du match." });
    }
  },

  addMatchToUser: async (userId, matchId) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("Utilisateur introuvable");
      }
      if (!Array.isArray(user.match)) {
        // Create match array  if not exist
        user.match = [];
      }
      // We add the matchId to the array
      user.match.push({ _id: matchId });

      await user.save();

    } catch (error) {
      console.error(error);
      throw new Error("Erreur serveur lors de la mise à jour de l'utilisateur");
    }
  },

  addPendingMatchToUser: async (matchUserId, userId, matchId) => {
    try {
      const user = await User.findById(matchUserId);
      if (!user) {
        throw new Error("Utilisateur introuvable");
      }

      if (!Array.isArray(user.pendingMatch)) {
        // Create pendingMatch Array if not exist
        user.pendingMatch = [];
      }
      // We add the userId and the matchId to the array
      user.pendingMatch.push({ _id: userId, matchId });
      await user.save();

    } catch (error) {
      console.error(error);
      throw new Error("Erreur serveur lors de la mise à jour de l'utilisateur");
    }
  },

  checkPendingMatch: async (userId, matchUserId) => {

    try {

      // We check if there is a pending match for the proposed user
      const user = await User.findById(userId);
      if (user.pendingMatch.length > 0) {

        // We search for the pendingMatch we are interested in and we get the index
        const pendingMatchIndex = user.pendingMatch.findIndex(

          // We compare the id of the user in the pending and the id of the user with whom we want to match
          (pending) => pending._id === matchUserId
        );
        // If there is a pending match we update the match
        if (pendingMatchIndex !== -1) {
          // We get the matchId
          const pendingMatchId = user.pendingMatch[pendingMatchIndex].matchId;
          // We update the value of accepted to true
          await Match.findByIdAndUpdate(pendingMatchId, { accepted: true });
          // We remove the match from the pending array
          user.pendingMatch.splice(pendingMatchIndex, 1);
          // We save the user data
          await user.save();

          // We get the updated match and return it
          const updatedMatch = await Match.findById(pendingMatchId);

          return updatedMatch;
        }
      }

      // If no pending match, we return null
      return null;

    } catch (error) {
      console.error(error);
      throw new Error("Erreur serveur lors de la vérification du match en attente.");
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
