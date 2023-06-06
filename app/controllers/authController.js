const User = require('../models/user.js');
const speTechnoLookup = require('../utils/speTechnoLookup')
const generateJwt = require('../utils/generateJWT');
const checkPassword = require('../utils/checkPassword');

const authController = {

  login: async (req, res) => {
    const { email, password } = req.body;
    try {

      // We get the user from the database
      const user = await User.aggregate(speTechnoLookup).match({ email });

      // We check if the user exists and if the password is correct
      if (!user || !(await checkPassword(password, user[0].password))) {
        return res.status(401).json({ error: 'Username or password error, please try again' });
      }

      // We generate a JWT token for the user
      const token = generateJwt(user[0]);

      // We send the JWT token in the response with status 200 and other informations
      res.status(200).json({ token, userId: user[0]._id, goalsSlug: user[0].goals.slug });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Connexion error' });
    }
  }
}


module.exports = authController;
