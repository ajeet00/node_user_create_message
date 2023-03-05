const response = require('../helpers/apiResponse');
const Joi = require('joi')
//* Include all validators
const Validators = require('../helpers/validators/userLoginValidator')

module.exports = function(validator) {
    if(!Validators.hasOwnProperty(validator))
        throw new Error(`'${validator}' validator is not exist`)

    return async function(req, res, next) {
        try {
          const validated = await Validators[validator].validateAsync(req.body)
          req.body = validated
          next();
        } catch (err) {
          return response.customeResponse(res, 422, err.message); 
        }
    }
}
