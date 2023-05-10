const jwt = require('jsonwebtoken');

// Function to generate a JWT
const generateJwt = (user) => {
  // Create a JWT with the user ID and pseudo
  const token = jwt.sign(
    { _id: user._id, pseudo: user.pseudo },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1d' } // Token expires after 1 day
  );
  return token;
}

module.exports = generateJwt;