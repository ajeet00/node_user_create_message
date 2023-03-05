const Joi = require('joi');

// Login Validation 
const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(5).required()
});


const signup = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(5).required(),
    fname : Joi.string().min(2).required(),
    lname : Joi.string().min(2).required(),
    createdBy : Joi.string().allow('').optional(),
    userType : Joi.string().allow('').optional(),
    userID : Joi.string().allow('').optional()
});


const userUpdate =  Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(5).required(),
    fname : Joi.string().min(2).required(),
    lname : Joi.string().min(2).required(),
    userType : Joi.string().allow('').optional(),
    userID : Joi.string().allow('').optional()
});


const message = Joi.object({
    message: Joi.string().min(5).max(150).required(),
    groupID : Joi.number().min(1).required()
});


const createGroup = Joi.object({
    groupName: Joi.string().min(5).max(50).required(),
    userIdList : Joi.array().items(Joi.number().required())
});

module.exports = {  loginSchema, signup, userUpdate, message, createGroup }