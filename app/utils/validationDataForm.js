const Joi = require('joi');

const validationDataForm = Joi.object({
  pseudo: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required().pattern(
    // This regex ensure that the email address that starts with one or more characters
    // then followed by the "@" symbol, then one or more characters, then followed by the
    // "." symbol, then two or three characters from the alphabet.
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/,
  ),
  city: Joi.string(),
  picture: Joi.string(),
  // When isCreatingUser is true, password is require else optional
  password: Joi.when('$isCreatingUser', {
    is: true,
    then: Joi.string().min(4).max(30).required(),
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
      'any.only': 'Passwords do not match',
    }),
    otherwise: Joi.string().allow(null).optional(),
  }),
  description: Joi.string(),
  status: Joi.string(),
  level: Joi.string(),
  goals: Joi.string().required(),
  technology: Joi.array(),
  specialization: Joi.string(),
}
);

module.exports = validationDataForm;
