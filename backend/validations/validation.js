const Joi = require('joi');

exports.createCourseSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    code: Joi.string().trim().alphanum().min(3).max(10).required(),
    description: Joi.string().trim().min(10).required(),
    departmentId: Joi.string().hex().length(24).required(),
    instructorId: Joi.array().items(Joi.string().hex().length(24)).required(),
    credits: Joi.number().integer().min(1).max(3).required(),
    semester: Joi.string().valid('Fall', 'Spring', 'Summer').required(),
    prerequisites: Joi.array()
        .items(Joi.string().hex().length(24))
        .optional()
});
