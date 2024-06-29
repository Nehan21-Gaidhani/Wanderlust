const Joi = require("joi")

const listingschema = Joi.object(
    {
        listing : Joi.object({
            title:Joi.string().required(),
            description:Joi.string().required(),
            image:Joi.string().allow("",null),
            price:Joi.number().min(0),
            location:Joi.string().required(),
            country:Joi.string().required(),
            category: Joi.string().valid('rooms', 'mountains', 'pools', 'villa', 'arctic', 'beach', 'farms', 'lake', 'island').required(),

        })
    }
)

const reviewschema = Joi.object(
    {
        review:Joi.object(
            {
                rating:Joi.number().required().min(1).max(5),
                comment:Joi.string().required(),
            }
        ).required(),
    }
)
module.exports = { listingschema, reviewschema };

