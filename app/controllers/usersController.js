const User = require('../models/user.js');
const Technology = require('../models/technology.js');
const Specialization = require('../models/specialization.js');
const Match = require('../models/match.js');
const bcrypt = require('bcrypt');
// import lookup pipeline to agregate specialization and technology collections to users
const speTechnoLookup = require('../utils/speTechnoLookup')
const validationDataForm = require('../utils/validationDataForm');

let lastUserId = null;

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
      res.status(500).json({ error: 'Failed to get users.' });
    }
  },

  // Todo : getOneUserByID

  createMatch: async (req, res) => {
    // const userId = req.user._id; // id de l'utilisateur connecté
    // console.log("userConnectedId", userId)
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

      // on vérifie si il y a un pending match pour l'utilisateur proposé
      const matchPending = await usersController.checkPendingMatch(userId, matchUserId);
      // Si il y a un match en attente on le valide
      if (matchPending) {
        await Match.findByIdAndUpdate(matchPending._id, { accepted: true });
        // On ajoute le match à l'utilisateur proposé
        await usersController.addMatchToUser(userId, matchPending._id);
        return res.status(200).json({ message: "C'est un match total, vous pouvez à présent commencer à discuter !" });
      }

      // Sinon on créé un nouveau match
      const match = new Match({
        user1_id: userId,
        user2_id: matchUserId,
        created_at: new Date(),
        accepted: false
      });
      await match.save();
      // On ajoute le match à l'utilisateur qui l'a demandé
      await usersController.addMatchToUser(userId, match._id);
      // On ajoute le match en pending à l'utilisateur proposé
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
      // On rajoute le match id dans le tableau
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
      // On ajoute l'id de l'utilisateur proposé ainsi que le matchId dans le tableau
      user.pendingMatch.push({ _id: userId, matchId });
      await user.save();

    } catch (error) {
      console.error(error);
      throw new Error("Erreur serveur lors de la mise à jour de l'utilisateur");
    }
  },

  checkPendingMatch: async (userId, matchUserId) => {

    try {
      // On vérifie si il y a un match en attente pour l'utilisateur proposé
      const user = await User.findById(userId);
      if (user.pendingMatch.length > 0) {

        // On cherche le pendingMatch qui nous intérésse et on récupère l'index
        const pendingMatchIndex = user.pendingMatch.findIndex(
          // On compare l'id de l'utilisateur dans le pending et l'id de l'utilisateur avec qui on veut matcher
          (pending) => pending._id === matchUserId
        );
        // Si il y a bien un pendingMatch
        if (pendingMatchIndex !== -1) {
          // on met à jour le match 
          const pendingMatchId = user.pendingMatch[pendingMatchIndex].matchId;
          // On modifie la valeur de accepted à  true
          await Match.findByIdAndUpdate(pendingMatchId, { accepted: true });
          // On supprime le match du pending array
          user.pendingMatch.splice(pendingMatchIndex, 1);
          // On sauvegarde les données de l'utilisateur
          await user.save();

          // On récupère le match mis à jour et on le retourne
          const updatedMatch = await Match.findById(pendingMatchId);

          return updatedMatch;
        }
      }

      // Si aucun match en attente, on retourne null
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

      // abortEarly is an option that specifies whether or not to stop the
      // validation as soon as the first error is encountered. By default,
      // abortEarly is set to true, which means that the validation will stop as
      // soon as it encounters the first error. If you set abortEarly to false,
      // however, the validation will continue and return all errors encountered.

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
