const User = require('../models/user.js');
const generateJwt = require('../utils/generateJWT');
const checkPassword = require('../utils/checkPassword');


const authController = {

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      // We get the user from the database
      const user = await User.findOne({ email });

      // We check if the user exists and if the password is correct
      if (!user || !(await checkPassword(password, user.password))) {
        return res.status(401).json({ error: 'Username or password error, please try again' });
      }

      // We generate a JWT token for the user
      const token = generateJwt(user);

      // We send the JWT token in the response with status 200
      res.status(200).json({ token, userId: user._id });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Connexion error' });
    }
  }
}

module.exports = authController;
