const Joi = require("joi");

const createProductValidation = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).max(99999).required(),
    stock: Joi.number().min(1).required(),
}).unknown(true);

const updateProductValidation = Joi.object({
    name: Joi.string().min(2).max(100),
    description: Joi.string(),
    price: Joi.number().min(0).max(99999),
    stock: Joi.number().min(1),
    RemoveImages : Joi.allow(),
}).unknown(true);

module.exports = {
    createProductValidation,
    updateProductValidation,
}