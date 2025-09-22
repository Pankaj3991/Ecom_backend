const Joi = require("joi");

const createProductValidation = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().required(),
    images:Joi.any().required(),
    price: Joi.number().min(0).max(99999).required(),
    stock: Joi.number().min(1).required(),
    category : Joi.string(),
    user: Joi.any().required(),
});

const updateProductValidation = Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string(),
    price: Joi.number().min(0).max(99999),
    stock: Joi.number().min(1),
    category : Joi.string(),
    RemoveImages : Joi.allow(),
});

module.exports = {
    createProductValidation,
    updateProductValidation,
}