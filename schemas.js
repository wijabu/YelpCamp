const BaseJoi = require( "joi" );
const sanitizeHtml = require( 'sanitize-html' );

//This middleware refers to "joi", a tool to define schemas and validate data in our models against those schemas. Joi schemas are distinct from Model schemas

//format: key: Joi.object() ---- you can then add .required() to require a value
// const campgroundSchema = Joi.object({
//     campground: Joi.object({
//         title: Joi.string().required(),
//         price: Joi.number().required().min(0),
//         image: Joi.string().required(),
//         location: Joi.string().required(),
//         description: Joi.string().required()
//     }).required()
// })


//Sanitizing HTML with Joi (from a later module on Common Security Issues)

const extension = ( joi ) => ( {
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate ( value, helpers ) {
        const clean = sanitizeHtml( value, {
          allowedTags: [],
          allowedAttributes: {},
        } );
        if ( clean !== value ) return helpers.error( 'string.escapeHTML', { value } )
        return clean;
      }
    }
  }
} );

const Joi = BaseJoi.extend( extension )
//////////////////

module.exports.campgroundSchema = Joi.object( {
  campground: Joi.object( {
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min( 0 ),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML()
  } ).required(),
  deleteImages: Joi.array()
} )

module.exports.reviewSchema = Joi.object( {
  review: Joi.object( {
    rating: Joi.number().required().min( 1 ).max( 5 ),
    body: Joi.string().required().escapeHTML()
  } ).required()
} )