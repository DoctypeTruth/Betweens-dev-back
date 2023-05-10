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
  password: Joi.string().min(8).max(30).required()
    .pattern(
      // This regex ensure that the password contains at least one lowercase and uppercase
      // letter, one digit, one special character. It also make sure the  minimum length
      // of 8 characters
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
    ),
  description: Joi.string(),
  status: Joi.string(),
  level: Joi.string(),
  goals: Joi.string(),
  technology: Joi.string(),
  // technology: Joi.object({
  //     name: Joi.string(),
  // }),
  specialization: Joi.string().required(),
  // specialization: Joi.object({

  //     name: Joi.string().required(),
  //     slug: Joi.string(),
  // }),
});

module.exports = validationDataForm;
