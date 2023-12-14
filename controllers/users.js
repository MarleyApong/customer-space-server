const bcrypt = require('bcrypt')
const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Users, Status, Roles, Envs } = require('../models')
const customError = require('../hooks/customError')

let label = "User"

// ROUTING RESSOURCE USER
// GET ALL USERS
exports.getAll = async (req, res, next) => {
   const page = parseInt(req.query.page) || 0
   const limit = parseInt(req.query.limit) || 10
   const status = parseInt(req.query.status)
   const role = parseInt(req.query.role)
   const env = parseInt(req.query.env)
   const sort = req.query.sort ? req.query.sort.toLowerCase() === 'asc' ? 'asc' : 'desc' : 'desc'
   const filter = req.query.filter ? req.query.filter : 'createdAt'
   const keyboard = req.query.k

   try {
      let whereClause = {}

      if (status) whereClause.idStatus = status
      if (role) whereClause.idRole = role
      if (env) whereClause.idEnv = env

      if (keyboard) {
         if (filter !== 'createdAt' && filter !== 'updateAt' && filter !== 'deletedAt') {
            whereClause = {
               ...whereClause,
               [filter]: {
                  [Op.like]: `%${keyboard}%`,
               },
            }
         }
         else {
            whereClause = {
               ...whereClause,
               [filter]: {
                  [Op.between]: [new Date(keyboard), new Date(keyboard + " 23:59:59")]
               },
            }
         }
      }

      const data = await Users.findAndCountAll({
         attributes: { exclude: ['password'] },
         where: whereClause,
         limit: limit,
         offset: page * limit,
         order: [[filter, sort]],
      })
      if (!data) throw new customError('NotFound', `${label} not found`)

      return res.json({
         content: {
            data: data.rows,
            totalpages: Math.ceil(data.count / limit),
            currentElements: data.rows.length,
            totalElements: data.count,
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
exports.getOne = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameters')

      let data = await Users.findOne({ where: { id: id } })
      if (!data) throw new customError('NotFound', `${label} does not exist`)

      return res.json({ content: data })
   } catch (err) {
      next(err)
   }
}

// CREATE
exports.add = async (req, res, next) => {
   try {
      const id = uuid()
      const { idRole, idEnv, idStatus, firstName, lastName, phone, email, password } = req.body
      if (!idRole || !idEnv || !idStatus || !firstName || !phone || !email || !password) throw new customError('MissingData', 'Missing Data')
      let data = await Users.findOne({ where: { email: email } })
      if (data) throw new customError('AlreadyExist', `${label} with ${email} already exists`)

      const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      const isValidPassword = regexPassword.test(password)
      if (!isValidPassword) throw new customError('RegexPasswordValidationError', `The password does not meet security requirements`)

      let hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND))
      if (!hash) throw new customError('ProcessHashFailed', `${label} Processing hash failed`)

      data = await Users.create({
         id: id,
         idRole: idRole,
         idEnv: idEnv,
         idStatus: idStatus,
         firstName: firstName,
         lastName: lastName,
         phone: phone,
         email: email,
         password: hash
      })
      if (!data) throw new customError('BadRequest', `${label} not created`,)

      return res.status(201).json({ message: `${label} created`, data: data })
   } catch (err) {
      next(err)
   }
}

// PATCH
exports.update = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameter')

      let data = await Users.findOne({ where: { id: id } })
      if (!data) throw new customError('NotFound', `This ${label} does not exist`)

      data = await Users.update(req.body, { where: { id: id } })
      if (!data) throw new customError('BadRequest', `${label} not modified`)
      return res.json({ message: `${label} modified` })
   } catch (err) {
      next(err)
   }
}

// PATCH STATUS
exports.changeStatus = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameter')


      let data = await Users.findOne({ where: { id: id } })
      if (!data) throw new customError('NotFound', `This ${label} does not exist`)
      let status = 1
      if (data.idStatus === 1) status = 2

      data = await Users.update({ idStatus: status }, { where: { id: id } })
      if (!data) throw new customError('BadRequest', `Status not modified`)
      return res.json({ message: `Status modified` })
   } catch (err) {
      next(err)
   }
}

// PATCH ROLES
exports.changeRole = async (req, res, next) => {
   try {
      const id = req.params.id
      const role = req.params.role
      if (!id) throw new customError('MissingParams', 'Missing Parameter')

      let data = await Users.findOne({ where: { id: id } })
      if (!data) throw new customError('NotFound', `This ${label} does not exist`)

      data = await Users.update({ idRole: role }, { where: { id: id } })
      if (!data) throw new customError('BadRequest', `${label} not modified`)
      return res.json({ message: `Role modified` })
   } catch (err) {
      next(err)
   }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameter')

      let data = await Users.findOne({ where: { id: id } })
      if (!data) throw new customError('NotFound', `${label} not exist`)

      data = await Users.destroy({ where: { id: id }, force: true })
      if (!data) throw new customError('BadRequest', `${label} not deleted`)

      return res.json({ message: `${label} deleted` })
   } catch (err) {
      next(err)
   }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameters')

      let data = await Users.findOne({ where: { id: id } })
      if (!data) throw new customError('NotFound', `${label} not exist`)

      data = await Users.destroy({ where: { id: id } })
      if (!data) throw new customError('BadRequest', `${label} not deleted`)

      return res.json({ message: `${label} deleted` })
   } catch (err) {
      next(err)
   }
}

// UNTRASH
exports.restore = async (req, res, next) => {
   try {
      const id = req.params.id
      if (!id) throw new customError('MissingParams', 'Missing Parameter')

      let data = await Users.restore({ where: { id: id } })
      if (!data) throw new customError('AlreadyExist', `${label} already restored or does not exist`)

      return res.json({ message: `${label} restored` })
   } catch (err) {
      next(err)
   }
}