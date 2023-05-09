const jwt = require('jsonwebtoken');

const checkJWT = (req, res, next) => {
  // Récupère les autorisations de connexion dans le header de la requete
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // On split le AutHeader pour récupérer le token
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    // On vérifie la validité du token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = checkJWT;