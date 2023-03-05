const httpStatus = require('http-status');
const ApiError = require('../helpers/apiError');
const response = require('../helpers/apiResponse');
const infoLog = require('../config/logger').infoLog;
const User = require('../models').User;
const GroupName = require('../models').GroupName;
const UserGroup = require('../models').UserGroup;
const Message = require('../models').Message;
const jwt = require('jsonwebtoken');
const Transaction = require('sequelize');
require('dotenv').config({ path: './../.env' });
const sequelizeConnection = require('../config/sequilize');
const bcrypt = require("bcrypt");


exports.verifyUserAndGenerateToken = async (email, password) => {

    try {  
           const userResponse = await getUserByEmail(email);
           const responseMessage = [];

           var result = {};
           result =  JSON.parse(JSON.stringify(userResponse));
           if( userResponse === null) {
              responseMessage['status'] = httpStatus.NOT_FOUND;
              responseMessage['message'] = "The user is not registered";
              return responseMessage;
           }

           const cus_password = result.password.trim(); 
           const req_password = password.trim();

           const compareResponse = await comparePassword(req_password, cus_password);
           console.log(compareResponse);
          
           if(compareResponse) {
              responseMessage['status'] = httpStatus.OK;
              const tokens = await generateAuthTokens(result.id);
              responseMessage['data'] = tokens;
              responseMessage['message'] = "Login successful";
           } else {
              responseMessage['status'] = httpStatus.NOT_FOUND;
              responseMessage['message'] = "Password is wrong";
              responseMessage['data'] = {};
           }

           return responseMessage;

    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Internal server error');
    }
}


async function getUserByEmail(email) {
    return await User.findOne({ where: { email: email } });
}


async function getUserByID(id) {
    return await User.findOne({ where: { id : id } });
}


async function hashPassword(plaintextPassword) {
    const hash = await bcrypt.hash(plaintextPassword, 10);
    return hash;
}

// compare password
async function comparePassword(plaintextPassword, hash) {
        const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}


const generateAuthTokens = async (ID) => {
    try{
       const accessToken = jwt.sign({ ID : `${ID}` }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
   //    const refreshToken = jwt.sign({ ID : `${ID}` }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } );
       const tokens = {
           accessToken: accessToken
       };

       await UpdateUserToken(accessToken, ID);
       return tokens;

    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }

 };


async function UpdateUserToken(token, ID) {
    try {
       await User.update(
                { loginToken: token },
                { where: { id : ID } }
            );

    } catch(error){
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }
}


exports.Signup = async (body) => {

    try {
            var checkUserExistance = await getUserByEmail(body.email);
            var responseMessage = [];

            if(checkUserExistance !== null) {
                responseMessage['status'] = httpStatus.CONFLICT;
                responseMessage['message'] = "User Already Exist";
                return responseMessage;
            }

            var passwordHash = await hashPassword(body.password);

            // usertype 2 means normal user
            var userType = (body?.userType !== undefined) ? body.userType : 2;
            var createdBy = (body?.userID !== undefined) ? body.userID : 0; 
            var response = await User.create({
                    firstName : body.fname,
                    lastName : body.lname,
                    email : body.email,
                    password : passwordHash,
                    userType : userType,
                    createdBy : createdBy
            });

            var checkCreation = response.toJSON();

            if(checkCreation?.id !== undefined) {
                responseMessage['status'] = httpStatus.OK;
                responseMessage['message'] = "User Created Successfully";
            } else {
                responseMessage['status'] = httpStatus.NOT_FOUND;
                responseMessage['message'] = "User Created Successfully";
            }
            return responseMessage;
    } catch(error) {
        console.log(error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }
}


exports.Logout = async (ID) => {
    try {

        var checkUserExistance = await getUserByID(ID);
        var responseMessage = [];

        if(checkUserExistance === null) {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "User Not Found";
            return responseMessage;
        }

        var Response = await User.update({ loginToken : '' },
            { where: { id : ID } }
        );

        if(Response) {
            responseMessage['status'] = httpStatus.OK;
            responseMessage['message'] = "User Logout Successfully";
        } else {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "User Logout failed ";   
        }
        return responseMessage;  


    } catch(error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }
}


exports.deleteUser = async (id) => {
    try {

        var checkUserExistance = await getUserByID(id);
        var responseMessage = [];

        if(checkUserExistance === null) {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "User Not Found";
            return responseMessage;
        }

        var Response = await User.destroy({ where: { id : id }  });
        if(Response) {
            responseMessage['status'] = httpStatus.OK;
            responseMessage['message'] = "User deleted Successfully";
        } else {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "User deletion failed";   
        }
        return responseMessage;

    } catch(error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }
}


exports.updateUsers = async (users) => {
     try {

        var checkUserExistance = await getUserByID(users.userID);
        var responseMessage = [];
        var userInfo = checkUserExistance.toJSON();

        if(checkUserExistance === null) {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "User Not Found";
            return responseMessage;
        }

        var userTypeValue = (users?.userType == undefined ) ? userInfo.userType : users.userType;

        var Response = await User.update({ firstName : users.fname, lastName : users.lname, email : users.email,
            password : users.password, userType : userTypeValue },
            { where: { id : users.userID } }
        );

        if(Response) {
            responseMessage['status'] = httpStatus.OK;
            responseMessage['message'] = "User details updated Successfully";
        } else {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "User updation failed";   
        }
        return responseMessage;  

     } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
     }
}



exports.createGroup = async (req) => {

    const t = await sequelizeConnection.transaction();

    try {
   
        var responseMessage = [];

        const checkGroupExistance = await GroupName.findOne({
            where:  { groupName : req.groupName }
        });
        
        if(checkGroupExistance?.id !== undefined ) {
            responseMessage['status'] = httpStatus.CONFLICT;
            responseMessage['message'] = "Group already exist";
            return responseMessage;
        }

        const GroupDetail = await GroupName.create({ groupName : req.groupName, createdBy : req.userID },  { transaction: t });
        const LastGroupDetails = GroupDetail.toJSON();

        if(LastGroupDetails?.id === undefined) {
            responseMessage['status'] = httpStatus.INTERNAL_SERVER_ERROR;
            responseMessage['message'] = "Group Creation Failed";
            return responseMessage;
        }

        if(req.userIdList.length > 0 ) {
            for (const UserID of req.userIdList) {
                const groupData = await UserGroup.create({ groupUserId : UserID, groupID : LastGroupDetails.id, createdBy : req.userID },  { transaction: t });
                const checkGroup = groupData.toJSON();
                if(checkGroup?.id === undefined) {
                    await t.rollback();
                }
            }
        } else {
            await t.rollback();
        }

        t.commit();
    
        responseMessage['status'] = httpStatus.OK;
        responseMessage['message'] = "Group Created Successfully";
        return responseMessage;

    } catch(error){
        await t.rollback();
        console.log(error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }

}  


exports.createMessage = async (body) => {
    try {

        var checkUserAndGroup = await UserGroup.findOne({ where : { groupUserId : body.userID, groupID : body.groupID }});
        var responseMessage = [];

        if(checkUserAndGroup === null) {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = " Group Not Found";
            return responseMessage;
        }

        const date = new Date();
        var Response = await Message.create({
            groupID :  body.groupID, message : body.message, createdBy : body.userID, createdDate : date
        });

        if(Response) {
            responseMessage['status'] = httpStatus.OK;
            responseMessage['message'] = "Message Send Successfully";
        } else {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "User updation failed";   
        }

        return responseMessage;  

    } catch(error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }
}


exports.deleteGroup = async(groupID) => {

    const t = await sequelizeConnection.transaction();

    try {

      var checkGroup = await GroupName.findOne({ where : { id : groupID } });
      var responseMessage = [];

      if(checkGroup === null) {
        responseMessage['status'] = httpStatus.NOT_FOUND;
        responseMessage['message'] = " Group Not Found";
        return responseMessage;
      }

      const UserGroupresponse =  await UserGroup.destroy({ where : { groupID : groupID }, transaction: t });
      const groupNameResponse = await GroupName.destroy( { where : { id : groupID }, transaction: t });

      t.commit();

      if(UserGroupresponse && groupNameResponse) {
            responseMessage['status'] = httpStatus.OK;
            responseMessage['message'] = "Group Deleted Successfully";
      } else {
            await t.rollback();
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "Group Deleted failed";   
      }

      return responseMessage;

    } catch(error) {
        await t.rollback();
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }
}


exports.getGroupList = async () => {
    try {

       const GroupData = await GroupName.findAll();
       responseMessage = [];

       if(GroupData != null) {
            responseMessage['status'] = httpStatus.OK;
            responseMessage['message'] = "Group Fetched Successfully";
            responseMessage['data'] = GroupData;
        } else {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "Group Fetch failed";  
            responseMessage['data'] = data;
        }

        return responseMessage;

    } catch(error) {
        console.log(error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");   
    }
}



exports.getUsersList = async () => {
    try {

       const UsersData = await User.findAll({attributes: ['firstName', 'lastName', 'email']});
       responseMessage = [];

       if(UsersData != null) {
            responseMessage['status'] = httpStatus.OK;
            responseMessage['message'] = "Users Fetched Successfully";
            responseMessage['data'] = UsersData;
        } else {
            responseMessage['status'] = httpStatus.NOT_FOUND;
            responseMessage['message'] = "Users Fetch failed";  
            responseMessage['data'] = UsersData;
        }

        return responseMessage;

    } catch(error) {
        console.log(error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");   
    }
}