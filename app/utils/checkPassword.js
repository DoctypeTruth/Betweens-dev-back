const bcrypt = require('bcrypt');

// Vérifie si le mot de passe est correct
const checkPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
}


module.exports = checkPassword;