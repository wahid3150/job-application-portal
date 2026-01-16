// 🧠 Golden Rule (Backend) api validation
// If a route accepts any external input (body, params, query) → it MUST be validated.
// That includes:
// req.body
// req.params
// req.query

const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(30).required().messages({
    "string.base": "Name must be a text value",
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name cannot exceed 30 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().lowercase().required().messages({
    "string.base": "Email must be a text value",
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a text value",
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),

  role: Joi.string().valid("jobseeker", "employer").required().messages({
    "any.only": "Role must be either 'jobseeker' or 'employer'",
    "any.required": "Role is required",
  }),

  // Optional fields
  companyName: Joi.when("role", {
    is: "employer",
    then: Joi.string().trim().min(2).required().messages({
      "string.base": "Company name must be a text value",
      "string.min": "Company name must be at least 2 characters long",
      "any.required": "Company name is required for employers",
    }),
    otherwise: Joi.forbidden().messages({
      "any.unknown": "Company name is only allowed for employers",
    }),
  }),

  companyDescription: Joi.string().optional().messages({
    "string.base": "Company description must be a text value",
  }),
}).options({
  abortEarly: false, //Return all validation errors, not just the first
  stripUnknown: true, //Remove fields not defined in the schema
});

module.exports = registerSchema;
