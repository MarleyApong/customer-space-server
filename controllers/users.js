const bcrypt = require('bcrypt')
const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Users, Status, Roles, Envs, UsersOrganizations, Organizations, Companies } = require('../models')
const customError = require('../hooks/customError')

let label = "User"

// ROUTING RESSOURCE USER
// GET ALL USERS
exports.getAllUsers = async (req, res, next) => {
   const page = parseInt(req.query.page) || 0
   const limit = parseInt(req.query.limit) || 10
   const status = parseInt(req.query.status) || 1
   const role = parseInt(req.query.role) || 1
   const env = parseInt(req.query.env) || 1
   const sort = req.query.sort ? req.query.sort.toLowerCase() === 'asc' ? 'asc' : 'desc' : 'desc'
   const filter = req.query.filter ? req.query.filter === '' ? 'id' : req.query.filter : 'id'
   const keyboard = req.query.k

   try {
      let where = {}

      if (keyboard)
         if (filter !== 'createdAt' && filter !== 'updateAt')
            where = {
               [filter]: {
                  [Op.like]: `%${keyboard}%`
               }
            }
         else
            where = {
               [filter]: {
                  [Op.between]: [new Date(keyboard), new Date(keyboard + " 23:59:59")]
               }
            }

      const users = await Users.findAndCountAll({
         attributes: { exclude: ['idRole', 'idEnv', 'idStatus', 'password'] },
         include: [
            { model: Status, attributes: ['id', 'name'] },
            { model: Roles, attributes: ['id', 'name'] },
            { model: Envs, attributes: ['id', 'name'] },
            // {
            //    model: Organizations, include: [
            //       { model: Companies }
            //    ]
            // }
         ],
         where: where,
         limit: limit,
         offset: page * limit,
         order: [[filter, sort]],
      })
      if (!users) throw new customError('NotFound', `${label} not found`)

      return res.json({
         content: {
            data: users.rows,
            totalpages: Math.ceil(users.count / limit),
            currentElements: users.rows.length,
            totalElements: users.count,
            filter: filter,
            sort: sort,
            limit: limit,
            page: page,
         }
      })
   } catch (err) {
      next(err)
   }
}

// GET ONE USER
exports.getOneUser = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameters')

      let user = await Users.findOne({
         include: [
            { model: Status, attributes: ['id', 'name'], where: { id: status } },
            { model: Roles, attributes: ['id', 'name'], where: { id: role } },
            { model: Envs, attributes: ['id', 'name'], where: { id: role } },
            // {
            //    model: Organizations, include: [
            //       { model: Companies }
            //    ]
            // }
         ],
         where: { id: id }
      })
      if (!user) throw new customError('NotFound', `${label} does not exist`)

      return res.json({ content: user })
   } catch (err) {
      next(err)
   }
}

// CREATE USER
exports.putUser = async (req, res, next) => {
   try {
      const id = uuid()
      const { idRole, idEnv, idOrganisation, idCompany, idStatus, firstName, lastName, phone, email, password } = req.body
      if (!idRole || !idEnv || !idOrganisation || !idCompany || !idStatus || !firstName || !phone || !email || !password) throw new customError('MissingData', 'Missing Data')
      let user = await Users.findOne({ where: { email: email } })
      if (user) throw new customError('AlreadyExist', `${label} with ${email} already exists`)

      let hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND))
      if (!hash) throw new customError('ProcessHashFailed', `${label} Processing hash failed`)
      req.body.password = hash

      const usersOrganizations = await UsersOrganizations.create({
         id: uuid(),
         idUser: id,
         idOrganisation: idOrganisation
      })
      if (!usersOrganizations) throw new customError('BadRequest', `Manager company not assigned`)

      user = await Users.create({
         id: id,
         idRole: idRole,
         idEnv: idEnv,
         idStatus: idStatus,
         firstName: firstName,
         lastName: lastName,
         phone: phone,
         email: email,
         password: password
      })
      if (!user) throw new customError('BadRequest', `${label} not created`,)

      return res.status(201).json({ message: `${label} created`, data: user })
   } catch (err) {
      next(err)
   }
}

// PATCH USER
exports.patchUser = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameter')

      let user = await Users.findOne({ where: { id: id } })
      if (!user) throw new customError('NotFound', 'This user does not exist')

      user = await Users.update(req.body, { where: { id: id } })
      if (!user) throw new customError('BadRequest', `${label} not modified`)
      return res.json({ message: 'User Update' })
   } catch (err) {
      next(err)
   }
}

// EMPTY TRASH
exports.deleteUser = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameter')

      let user = await Users.findOne({ where: { id: id } })
      if (!user) throw new customError('NotFound', `${label} not exist`)

      user = await Users.destroy({ where: { id: id }, force: true })
      if (!user) throw new customError('BadRequest', `${label} not deleted`)

      return res.json({ message: 'User deleted' })
   } catch (err) {
      next(err)
   }
}

// SAVE TRASH
exports.deleteTrashUser = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameters')

      let user = await Users.findOne({ where: { id: id } })
      if (!user) throw new customError('NotFound', `${label} not exist`)

      user = await Users.destroy({ where: { id: id } })
      if (!user) throw new customError('BadRequest', `${label} not deleted`)

      return res.json({ message: 'User deleted' })
   } catch (err) {
      next(err)
   }
}

// UNTRASH
exports.untrashUser = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameter')

      let user = await Users.findOne({ where: { id: id } })
      if (!user) throw new customError('NotFound', `${label} not exist`)

      user = await Users.restore({ where: { id: id } })
      if (!user) throw new customError('AlreadyExist', `${label} already restored`)

      return res.json({ message: "user restored !", data: user })
   } catch (err) {
      next(err)
   }
}