module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        firstName : {
            type : DataTypes.STRING,
            allowNull : false,
            validate : {
                notEmpty : true
            }
        },
        lastName : {
            type : DataTypes.STRING,
            allowNull : false,
            validate : {
                notEmpty : true
            }
        },
        email : {
            type : DataTypes.STRING,
            allowNull : false,
            validate : {
                notEmpty : true
            }
        }, 
        password : {
            type : DataTypes.STRING,
            allowNull : false,
            validate : {
                notEmpty : true
            }
        },
        loginToken : {
            type : DataTypes.STRING,
            allowNull : true
        },
        userType : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        createdBy : {
            type : DataTypes.INTEGER,
            allowNull : false
        }
    },{
        timestamps: false
      })

    return User;
}