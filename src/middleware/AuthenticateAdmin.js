

var jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const ApiError = require('../helpers/apiError');
require('dotenv').config();
const apiResponse = require("../helpers/apiResponse");
const User = require('../models').User;

module.exports = async function isAdmin(req, res, next) {
    try {

        const accessToken  =  req.headers.accesstoken;
        if(accessToken && typeof accessToken !== 'undefined' && accessToken.length > 20) { 
            const result =  await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            if(result === null) {
               throw new ApiError(httpStatus.NOT_FOUND, 'Bad Request');
            }
            
            req.body.userID = result.ID;

            const UserValue = await User.findOne({ where: { id : result.ID } });

            if(UserValue != null) {
               const CheckAdminOrNot = UserValue.toJSON();
               // User Type 1 is Admin Type 
               if(CheckAdminOrNot.userType != "1") {
                   apiResponse.customeResponse(res, httpStatus.NOT_FOUND, 'Invalid Request');
               }

               if(CheckAdminOrNot.loginToken != accessToken){
                   apiResponse.customeResponse(res, httpStatus.NOT_FOUND, 'Please login again');
               }

               next();

            } else {
                apiResponse.customeResponse(res, httpStatus.NOT_FOUND, 'User Not Found');
            }
            
        } else {
            apiResponse.customeResponse(res, httpStatus.NOT_FOUND, 'Invalid Access Token');
        }
     } catch(error) {
         apiResponse.customeResponse(res, httpStatus.NOT_FOUND, 'Your token has been expired');
     }
};

