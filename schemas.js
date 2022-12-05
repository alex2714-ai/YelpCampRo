import BaseJoi from "joi";

import sanitizeHtml from "sanitize-html";

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const joi = BaseJoi.extend(extension);

const campgroundSchema = joi.object({
  campground: joi
    .object({
      title: joi.string().required().escapeHTML(),
      price: joi.number().required().min(0),
      location: joi
        .object({
          judet: joi.string().required().escapeHTML(),
          localitate: joi.string().required().escapeHTML(),
        })
        .required(),

      // images: joi.array().required(),
      description: joi.string().required().escapeHTML(),
    })
    .required(),
  deleteImages: joi.array(),
});

export default campgroundSchema;

export const reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().integer().required().min(1).max(5),
      body: joi.string().max(500).escapeHTML(),
    })
    .required(),
});
