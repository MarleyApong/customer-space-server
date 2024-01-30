const { Op } = require('sequelize')
const { Customers, Answers, Status } = require('../models')
const customError = require('../hooks/customError')

var label = "customer"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k

    try {
        let whereClause = {}
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

        const data = await Customers.findAll({
            where: whereClause,
            include: [
                { model: Answers }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })

        // const inProgress = await Customers.count({
        //     include: [
        //         {
        //             model: Status,
        //             where: { name: 'actif' }
        //         }
        //     ]
        // })

        // const blocked = await Customers.count({
        //     include: [
        //         {
        //             model: Status,
        //             where: { name: 'inactif' }
        //         }
        //     ]
        // })
        const totalElements = await Customers.count()
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({
            content: {
                data: data,
                totalpages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements,
                // inProgress: inProgress,
                // blocked: blocked,
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

// GET ONE
exports.getOne = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Customers.findOne({
            where: { id: id },
            include: [
                { model: Answers }],
        })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        const { idUser, idProduct, quantity } = req.body
        if (!idQuestion || !note) throw new customError('MissingData', 'missing data')
        const id = uuid()
        let data = await Orders.findOne({ where: { id: id } })
        if (data) throw new customError('AlreadtExist', `This ${label} already exists`)

        data = await Users.findOne({ where: { id: idUser } })
        if (!data) if (data) throw new customError('NotFound', `${label} not created because the user with id: ${idUser} does not exist`)

        await Tables.crea

        data = await Orders.create({
            id: uuid(),
            idUser: idUser,
            idTable: '',
            idProduct: idProduct,
            quantity: quantity
        })
        if (!data) throw new customError('BadRequest', `${label} not created`)

        await OrdersProducts.create({
            id: uuid(),
            idOrder: idOrder,
            idProduct: idProduct
        })

        await Notification.create({ id: uuid(), status: 1 })

        return res.status(201).json({ message: `${label} created`, content: data })
    } catch (err) {
        next(err)
    }
}

// UPDATE
exports.update = async (req, res, next) => {
    try {
        const idCustomer = req.params.id
        if (!idCustomer) throw new customError('MissingParams', 'missing parameter')

        const {name, phone } = req.body
        if (!name || !phone) throw new customError('MissingData', 'missing data')
        let data = await Customers.findOne({ where: { id: idCustomer } })
        if (!data) throw new customError('AlreadtExist', `this ${label} does not exist`)

        data = await Customers.update({ name: name, phone: phone },
            { where: { id: idCustomer } }
        )
        if (!data) throw new customError('BadRequest', `${label} not updated`)

        return res.status(201).json({ message: `${label} updated`, content: data })
    } catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Customers.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Customers.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('AlreadyExist', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Customers.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Customers.destroy({ where: { id: id } })
        if (!data) throw new customError('AlreadyExist', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Customers.restore({ where: { id: id } })
        if (!data) throw new customError('AlreadyExist', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}