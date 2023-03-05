const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    define: {
        timestamps: true,
        freezeTableName: true
      },
    logging: false
  },
);

sequelize
  .authenticate()
  .then(() => {
    console.log('MSSQL db connected successfully');
  })
  .catch((err) => {
    console.error('Unable to connect to the MSSQL database:', err);
});
module.exports = sequelize;