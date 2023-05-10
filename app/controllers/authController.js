const User = require('../models/user.js');
const generateJwt = require('../utils/generateJWT');
const checkPassword = require('../utils/checkPassword');


const authController = {

  login: async (req, res) => {
    const { pseudo, password } = req.body;
    try {
      // On récupère l'utilisateur dans la base de données
      const user = await User.findOne({ pseudo });

      // On vérifie si l'utilisateur existe et si le mot de passe est correct
      if (!user || !(await checkPassword(password, user.password))) {
        return res.status(401).json({ error: 'Username or password error, please try again' });
      }

      // On génère un token JWT pour l'utilisateur
      const token = generateJwt(user);

      // On envoie le token JWT dans la réponse avec le status 200
      res.status(200).json({ token });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Connexion error' });
    }
  }
}

module.exports = authController;
