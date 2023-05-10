const User = require('../models/user.js');
const Match = require('../models/match.js');

const matchController = {

  createMatch: async (req, res) => {
    const userId = req.user._id; // id de l'utilisateur connecté
    // const userId = "78xzpouz1ua8c9n511v1ed"; // Temporairement manuel, sera récupéré dans la session
    const { matchUserId } = req.params; // id de l'utilisateur avec qui on veut matcher

    try {
      // We check if the user is trying to match with themselves
      if (userId === matchUserId) {
        return res.status(400).json({ error: "Vous ne pouvez pas matcher avec vous-même." });
      }

      // We check if there is a pending match for the proposed user
      const matchPending = await matchController.checkPendingMatch(userId, matchUserId);
      // If there is a pending match we validate it
      if (matchPending) {
        await Match.findByIdAndUpdate(matchPending._id, { accepted: true });
        // We add the match to the proposed user
        await matchController.addMatchToUser(userId, matchPending._id);
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
      await matchController.addMatchToUser(userId, match._id);
      // We add the match in pending to the proposed user
      await matchController.addPendingMatchToOtherUser(matchUserId, userId, match._id);

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

  addPendingMatchToOtherUser: async (matchUserId, userId, matchId) => {
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
}

module.exports = matchController;