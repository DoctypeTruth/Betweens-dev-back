const bcrypt = require('bcrypt');

// Fonction pour vérifier si le mot de passe est ok
const checkPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
}


module.exports = checkPassword;