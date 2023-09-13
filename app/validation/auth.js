const Joi = require('joi');

const login = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  device_token: Joi.string().required(),
  device_id: Joi.string().required(),
  device_type: Joi.string().default('web').optional()
});
const userSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .insensitive()
    .required() // Convert the email value to lowercase for validation
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  fullname: Joi.string().regex(/^[a-zA-Z\s]*$/).min(2).max(100).required()
    .messages({ 'any.required': 'Fullname is required', 'string.min': 'Password must be at least 4 characters long' }),
  password: Joi.string().min(4).required().messages({ 'any.required': 'Password is required' }),
  profileImage: Joi.string().allow(''),
  session: Joi.string().allow(''),
  // phoneNumber: Joi.string().required().messages({ 'any.required': 'phoneNumber is required' })
  phoneNumber: Joi.string().min(10).max(13).required().messages({
    // 'string.pattern.base': 'Invalid Phone number',
    'any.required': 'Phone number Required',
    'string.min': 'Phone number must have at least 10 digits and not more than 12 digits',
    'string.max': 'Phone number must have at least 10 digits and not more than 12 digits',
    'string.empty': 'Phone Number is not allowed to be empty'
  })
});

const passwordSchema = Joi.object({
  currentPassword: Joi.string().min(4)
    .required()
    .messages({
      'string.base': 'Password must be a string',
      'string.min': 'newPassword must be at least {{#limit}} characters long',
      // 'string.pattern.base': 'Password must follow the specified pattern',
      'any.required': 'newPassword is required'
    }),
  newPassword: Joi.string()
    .min(4)
    .required()
    // .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')) // Example pattern, customize as needed
    .messages({
      'string.base': 'Password must be a string',
      'string.min': 'newPassword must be at least {{#limit}} characters long',
      // 'string.pattern.base': 'Password must follow the specified pattern',
      'any.required': 'newPassword is required'
    })
});

const postSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.base': 'title must be a string',
    'any.required': ' title is required'
  }),
  image: Joi.string()
  // userId: Joi.number().integer().messages({
  //   'any.required': ' userId is required',
  //   'number.base': 'User ID must be a number',
  //   'number.integer': 'User ID must be an integer'
  // })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required() // Convert the email value to lowercase for validation
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  // password: Joi.string().min(4)
  password: Joi.string().min(4).required().messages({ 'any.required': 'Password is required' })
});
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required() // Convert the email value to lowercase for validation
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});
const resetPasswordSchema = Joi.object({
  password: Joi.string().min(4).required().messages({ 'any.required': 'Password is required' }),
});
const emailSchemas = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .required() // Convert the email value to lowercase for validation
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});
// BASIX AUTH SEE

module.exports = {
  login,
  userSchema,
  passwordSchema,
  postSchema,
  loginSchema,
  emailSchemas,
  forgotPasswordSchema,
  resetPasswordSchema
};
