var jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const ApiError = require('../helpers/apiError');
require('dotenv').config();
const apiResponse = require("../helpers/apiResponse");
const User = require('../models').User;

module.exports = async function isLoggedIn(req, res, next) {
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
                const CheckUserStatus = UserValue.toJSON();
                if(CheckUserStatus.loginToken == accessToken){
                    next();
                } else {
                    apiResponse.customeResponse(res, httpStatus.NOT_FOUND, 'Please login again');
                }
              
            } else {
                apiResponse.customeResponse(res, httpStatus.NOT_FOUND, 'Invalid Access Token');
            }

        } else {
            apiResponse.customeResponse(res, httpStatus.NOT_FOUND, 'Invalid Access Token');
        }
     } catch(error) {
         apiResponse.customeResponse(res, httpStatus.NOT_FOUND, 'Your token has been expired');
     }
};

