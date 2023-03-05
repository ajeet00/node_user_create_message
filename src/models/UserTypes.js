module.exports = (sequelize, DataTypes) => {
    const UserType = sequelize.define("UserType", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        UserName : {
            type : DataTypes.STRING,
            allowNull : false
        }
    },
    {
        timestamps: false
    });

    return UserType;
}