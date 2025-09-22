const Joi = require("joi");
const categoryValidation = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description : Joi.string().required(),
});

module.exports = {categoryValidation};