const httpStatus = require('http-status');
const ApiError = require('../helpers/apiError');
const response = require('../helpers/apiResponse');
const infoLog = require('../config/logger').infoLog;
const userService = require('../services/UserServices');


exports.login = async(req, res, next) => {
    try {
        
        const { email, password } = req.body;
        const token = await userService.verifyUserAndGenerateToken(email, password);
        response.customeResponse(res, token['status'], token['message'], token["data"]);

    } catch (error) {
         next(error);
    }
}


exports.logout = async(req, res, next) => {
    try {
        
        const { userID } = req.body;
        const responseLogout = await userService.Logout(userID);
        response.customeResponse(res, responseLogout['status'], responseLogout['message']);

    } catch (error) {
         next(error);
    }
}



exports.signup = async(req, res, next) => {
    try {

        const signupResponse = await userService.Signup(req.body);
        response.customeResponse(res, signupResponse['status'], signupResponse['message']);

    } catch(error) {
        next(error);
    }
}


exports.deleteRecord = async(req, res, next) => {
    try {

      const deleteUser = await userService.deleteUser(req.params.id);
      response.customeResponse(res, deleteUser['status'], deleteUser['message']);

    } catch(error) {
        next(error);
    }
}


exports.updateRecord = async(req, res, next) => {
    try {

      const updateUser = await userService.updateUsers(req.body);
      response.customeResponse(res, updateUser['status'], updateUser['message']);

    } catch(error) {
        next(error);
    }
}



exports.createGroup = async(req, res, next) => {
    try {

        const createGroup = await userService.createGroup(req.body);
        response.customeResponse(res, createGroup['status'], createGroup['message']);

    } catch(error) {
        next(error);
    }
}


exports.createMessage = async (req, res, next) => {
    try {
        
        const createMessage = await userService.createMessage(req.body);
        response.customeResponse(res, createMessage['status'], createMessage['message']);

    } catch (error) {
        next(error);
    }
}



exports.deleteGroup = async (req, res, next) => {
    try {
        
        const responseGroup = await userService.deleteGroup(req.params.id);
        response.customeResponse(res, responseGroup['status'], responseGroup['message']);

    } catch (error) {
        next(error);
    }
}



exports.getGroupList = async (req, res, next) => {
    try {

        const responseGroup = await userService.getGroupList();
        response.customeResponse(res, responseGroup['status'], responseGroup['message'], responseGroup["data"]);

    } catch (error) {
        next(error);
    }
}



exports.getUsersList = async (req, res, next) => {
    try {

        const responseUsers = await userService.getUsersList();
        response.customeResponse(res, responseUsers['status'], responseUsers['message'], responseUsers["data"]);

    } catch (error) {
        next(error);
    }
}



