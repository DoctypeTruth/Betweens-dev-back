const bcrypt = require('bcrypt');

// Verifie if the password is correct

const checkPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
}


module.exports = checkPassword;