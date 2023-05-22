const Joi = require('joi');

const validationDataForm = Joi.object({
  pseudo: Joi.string().min(3).max(30).required().messages({'string.empty': 'Le pseudo est manquant'}),
  email: Joi.string().email().required().pattern(
    // This regex ensure that the email address that starts with one or more characters
    // then followed by the "@" symbol, then one or more characters, then followed by the
    // "." symbol, then two or three characters from the alphabet.
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/,
  ).messages({"string.empty" : "L'email est invalide"}),
  city: Joi.string().allow('').optional(),
  picture: Joi.string().allow('').optional(),
  // When isCreatingUser is true, password is require else optional
  password: Joi.when('$isCreatingUser', {
    is: true,
    then: Joi.string().min(4).max(30).required().messages({'string.empty': 'Le mot de passe est manquant'}),
    otherwise: Joi.string().allow(null).optional(),
  }),
  // .pattern(
  //   // This regex ensure that the password contains at least one lowercase and uppercase
  //   // letter, one digit, one special character. It also make sure the  minimum length
  //   // of 8 characters
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
  // ),
  confirmPassword: Joi.when('$isCreatingUser', {
    is: true,
    then: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Le mot de passe ne correspond pas',
    }),
    otherwise: Joi.string().allow(null).optional(),
  }),
  description: Joi.string().allow('').optional(),
  status: Joi.string().allow('').optional(),
  level: Joi.string().allow('').optional(),
  goals: Joi.string().required().messages({'string.empty': 'Vous devez selectionner un type de profil'}),
  technology: Joi.array().optional(),
  specialization: Joi.string().required().messages({'string.empty': 'Vous devez selectionner une spécialisation'}),
}
);

module.exports = validationDataForm;
