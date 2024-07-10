const Joi = require('joi');

const listingSchema = Joi.object({
   listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
   //  image: Joi.object({
   //    filename: Joi.string().required(),
   //    url: Joi.string().required().uri()
   //  }).required(),
    image: Joi.string().uri().empty('').default("https://images.unsplash.com/photo-1719084434335-5ad31ef8f83f?q=80&w=1899&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
    
   }).required()
});

const reviewSchema = Joi.object({
   review: Joi.object({
      rating: Joi.number().min(1).max(5).required(),
      comment: Joi.string().required(),
   }).required(),
});
module.exports = { listingSchema, reviewSchema };