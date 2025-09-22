const Joi = require("joi");

// Schema for user registration validation
const registerValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("user", "supplier").optional(),
  password: Joi.string().min(5).required(),
}).unknown(true);

// Schema for user login validation
const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
});

// Schema for user update profile validation
const updateProfileValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  role: Joi.string().valid("user", "supplier").optional(),
}).unknown(true);

// Schema for user password update validation
const updatePwdValidation = Joi.object({
  oldPassword: Joi.string().min(5).required(),
  newPassword: Joi.string().min(5).required(),
});

// Schema for user role update validation -- admin
const updateRoleValidation = Joi.object({
  role: Joi.string().valid("admin", "user", "supplier").required(),
});

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  updatePwdValidation,
  updateRoleValidation,
};
