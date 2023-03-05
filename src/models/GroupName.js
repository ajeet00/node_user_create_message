module.exports = (sequelize, DataTypes) => {
    const GroupName = sequelize.define("GroupName", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        groupName : {
            type : DataTypes.STRING,
            allowNull : false,
            validate : {
                notEmpty : true
            }
        },
        createdBy : {
            type : DataTypes.INTEGER,
            allowNull : false,
            validate : {
                notEmpty : true
            }
        }
    },{
        timestamps: false
    })
    return GroupName;
}