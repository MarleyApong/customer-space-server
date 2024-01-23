const bcrypt = require("bcrypt")
const { v4: uuid } = require("uuid")
const { Roles, Status, Envs, Users } = require("../models")

module.exports = async () => {
   // SEEDERS STATUS DEFAUT
   try {
      let status = await Status.findAll()
      if (status.length == 0) {
         status = await Status.bulkCreate([
            {
               id: uuid(),
               name: 'actif'
            },
            {
               id: uuid(),
               name: 'inactif'
            }
         ])

         if (!status) console.error('===================Error init status defauld !===================')
         console.log('===================Status defauld created !===================')
      }
      console.log('===================Status defauld initialized !===================')

      // SEEDERS ROLES DEFAUT
      let roles = await Roles.findAll()
      if (roles.length == 0) {
         roles = await Roles.bulkCreate([
            {
               id: uuid(),
               name: 'super admin'
            },
            {
               id: uuid(),
               name: 'admin'
            },
            {
               id: uuid(),
               name: 'simple user'
            },
            {
               id: uuid(),
               name: 'server'
            },
           
            
         ])

         if (!roles) console.error('Error init roles defauld !')
         console.log('===================Roles defauld created !===================')
      }
      console.log('===================Roles defauld initialized !===================')

      // SEEDERS ENVS DEFAUT
      let envs = await Envs.findAll()
      if (envs.length == 0) {
         envs = await Envs.bulkCreate([
            {
               id: uuid(),
               name: 'internal'
            },
            {
               id: uuid(),
               name: 'external'
            }
         ])

         if (!envs) console.error('===================Error init envs defauld !===================')
         console.log('===================Envs defauld created !===================')
      }
      console.log('===================Envs defauld initialized !===================')

      // SEEDERS USERS DEFAUT
      let user = await Users.findOne({ where: { email: "marlexapong90@gmail.com" } })

      if (!user) {
         const role = await Roles.findOne({where: {name: 'super admin'}})
         const env = await Envs.findOne({where: {name: 'internal'}})
         const status = await Status.findOne({where: {name: 'actif'}})
         const hash = await bcrypt.hash("Marley@123", parseInt(process.env.BCRYPT_SALT_ROUND))
         if (!hash) console.error("===================Error hash password user defauld !===================")

         user = await Users.create({
            id: uuid(),
            idRole: role.id,
            idEnv: env.id,
            idStatus: status.id,
            firstName: "apong",
            lastName: "marley",
            phone: "655371420",
            email: "marlexapong90@gmail.com",
            password: hash,
         })
         if (!user) console.error("===================Error init user defauld !===================")

         console.log("===================User by defauld created !===================")
      }
      console.log("===================User already init !===================")
   } catch (err) {

   }
}