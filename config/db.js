const { Sequelize } = require("sequelize")
const path = require("path")

// LOAD CONFIGURATION
const env = process.env.NODE_ENV || "production"
const configPath = path.join(__dirname, "config.json")
const config = require(configPath)[env]

// INITIALIZE CONNECTION WITH SEQUELIZE
const sequelize = new Sequelize(
   config.database,
   config.username,
   config.password,
   {
      host: config.host,
      dialect: config.dialect,
      logging: config.logging,
      define: {
         freezeTableName: true
      }
   }
)

// TEST CONNECTION
sequelize.authenticate()
   .then(() => {
      console.log("Connection to DB: Ok")
   })
   .catch((err) => {
      console.error("Connection to DB:", err)
   })

module.exports = sequelize
