const jwt = require('jsonwebtoken');

// Fonction pour générer un token JWT
const generateJwt = (user) => {
  // Création du token avec les données de l'utilisation
  const token = jwt.sign(
    { _id: user._id, pseudo: user.pseudo },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1d' } // durée de validité du token : 1jour
  );
  return token;
}

module.exports = generateJwt;