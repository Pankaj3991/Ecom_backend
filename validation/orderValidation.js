const Joi = require("joi");

const status = ["Processing", "Shipped", "Delivered"];

const orderItemValidation = Joi.object({
  product: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const shippingInfoValidation = Joi.object({
  phone: Joi.string()
    .length(10)
    .required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.number().required(),
  country: Joi.string().required(),
});

exports.placeOrderValidation = Joi.object({
  orderItem: orderItemValidation.required(),
  shippingInfo: shippingInfoValidation.required(),
});

exports.updateStatusValidation = Joi.object({
  orderStatus: Joi.string()
    .valid(...status)
    .required(),
});
