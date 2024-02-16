const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Orders, Users, OrdersProducts, Tables, Status, Companies, Notifications, Products } = require('../models')
const customError = require('../hooks/customError')

const label = "order"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k

    try {
        let whereClause = {}
        if (status) {
            if (status !== 'actif' && status !== 'inactif') {
                whereClause.idStatus = status
            }
            else {
                const statusData = await Status.findOne({ where: { name: status } })
                whereClause.idStatus = statusData.id
            }
        }

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

        const data = await Orders.findAll({
            where: whereClause,
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })
        const totalElements = await Orders.count()
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({
            content: {
                data: data.rows,
                totalpages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements,
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

        const data = await Orders.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}

// GET ORDER BY COMPANY
exports.getOrderByCompany = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k

    try {
        let whereClause = {}
        let statusNotification = ''
        if (status) {
            if (status !== 'actif' && status !== 'inactif') {
                statusNotification = status
            }
            else {
                const statusData = await Status.findOne({ where: { name: status } })
                statusNotification = statusData.id
            }
        }

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

        const id = req.params.id
        const data = await Orders.findAll({
            where: whereClause,
            include: [
                {
                    model: Tables,
                    include: [
                        {
                            model: Companies,
                            attributes: ['id'],
                            where: { id: id }
                        }
                    ]
                },
                {
                    model: OrdersProducts,
                    attributes: ['id'],
                    include: [
                        {
                            model: Products
                        }
                    ]
                },
                {
                    model: Notifications,
                    where: { idStatus: statusNotification }
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })

        const totalElements = await Orders.findAll({
            include: [
                {
                    model: Tables,
                    include: [
                        {
                            model: Companies,
                            attributes: ['id'],
                            where: { id: id }
                        }
                    ]
                },
                {
                    model: OrdersProducts,
                    attributes: ['id'],
                    include: [
                        {
                            model: Products
                        }
                    ]
                },
                {
                    model: Notifications,
                    where: { idStatus: statusNotification }
                }
            ]
        })

        const processed = await await Orders.findAll({
            include: [
                {
                    model: Tables,
                    include: [
                        {
                            model: Companies,
                            attributes: ['id'],
                            where: { id: id }
                        }
                    ]
                },
                {
                    model: OrdersProducts,
                    attributes: ['id'],
                    include: [
                        {
                            model: Products
                        }
                    ]
                },
                {
                    model: Notifications,
                    where: {
                        idStatus: {
                            [Op.not]: statusNotification
                        }
                    }
                }
            ]
        })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({
            content: {
                data: data,
                totalpages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements.length,
                processed: processed.length,
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

// GET ORDER BY USER
exports.getOrderByUser = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    try {
        const company = req.params.company
        if (!company) throw new customError('MissingParams', 'missing parameter')

        const user = req.params.user
        if (!user) throw new customError('MissingParams', 'missing parameter')
        const data = await Orders.findAll({
            where: { idUser: user },
            include: [
                {
                    model: Tables,
                    include: [
                        {
                            model: Companies,
                            attributes: ['id'],
                            where: { id: company }
                        }
                    ]
                }
            ],
            limit: limit,
            offset: (page - 1) * limit
        })
        if (!data) throw new customError('NotFound', `${label} not found`)

        // GET DATE NOW
        const today = new Date()
        const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

        const ordersToday = await Orders.findAll({
            where: { 
                idUser: user,
                createdAt: {
                    [Op.between]: [startDate, endDate] // BETWEEN MIDNIGHT AND 11:59 p.m. TODAY
                }
            },
            include: [
                {
                    model: Tables,
                    include: [
                        {
                            model: Companies,
                            attributes: ['id'],
                            where: { id: company }
                        }
                    ]
                }
            ]
        })

        return res.json({
            content: {
                data: data,
                totalpages: Math.ceil(data.length / limit),
                currentElements: data.length,
                totalElements: data.length,
                ordersToday: ordersToday.length,
                limit: limit,
                page: page,
            }
        })
    } catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        const { orders, idTable, webPageCompany } = req.body

        // CHECK THAT ORDERS IS A NON-EMPTY ARRAY OF OBJECTS
        if (!Array.isArray(orders) || orders.length === 0) {
            throw new customError('MissingData', 'missing data')
        }

        // CHECK THAT EACH ORDER HAS ALL REQUIRED PROPERTIES
        const requiredProps = ['idProduct', 'name', 'price', 'quantity', 'total']
        for (const order of orders) {
            for (const prop of requiredProps) {
                if (!order.hasOwnProperty(prop)) {
                    throw new customError('MissingData', 'missing data')
                }
            }
        }

        // CHECK FOR THE PRESENCE OF THE ID TABLE AND WEBPAGECOMPANY
        if (!idTable || !webPageCompany) {
            throw new customError('MissingData', 'missing data')
        }

        // CHECK TABLE
        let data = await Tables.findOne({
            where: { id: idTable },
            attributes: ['id'],
            include: [
                {
                    model: Companies,
                    where: { webpage: webPageCompany }
                }
            ]
        })
        if (!data) throw new customError('NotFound', `${label} not created because the table does not exist`)

        // CHECK ORDER
        const id = uuid()

        data = await Orders.findOne({ where: { id: id } })
        if (data) throw new customError('AlreadyExist', `this ${label} already exists`)

        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0') // ADD 0 TO LEFT
        const day = String(today.getDate()).padStart(2, '0') // ADD 0 TO LEFT
        const formattedDate = `${year + month + day}`

        let newLastName = ''
        const lastName = await Orders.findOne({
            order: [['createdAt', 'DESC']]
        })
        if (!lastName) {
            newLastName = `C${formattedDate + 1000}`
        }
        else {
            const currentName = lastName.name
            const numberStr = currentName.replace(/^C/, '')
            const number = parseInt(numberStr, 10)
            const incrementNumber = number + 1
            newLastName = `C${incrementNumber}`
        }


        data = await Orders.create({
            id: id,
            idTable: idTable,
            name: newLastName
        })
        if (!data) throw new customError('BadRequest', `${label} not created`)

        const status = await Status.findOne({
            attributes: ['id'],
            where: {
                name: 'actif'
            }
        })

        // ISSUE A NOTIFICATION 'Socket.io'
        req.io.emit('newOrder', { message: 'New order added!' })

        await Notifications.create({
            id: uuid(),
            idOrder: id,
            idStatus: status.id
        })

        orders.map(async (order) => {
            await OrdersProducts.create({
                id: uuid(),
                idOrder: id,
                idProduct: order.idProduct,
                price: order.price,
                quantity: order.quantity
            })

            return { ordersProducts: OrdersProducts }
        })

        return res.status(201).json({ message: `${label} created`, content: data })
    } catch (err) {
        next(err)
    }
}

// PATCH
exports.update = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')
        if (!req.body.quantity) throw new customError('MissingData', 'missing data')

        let data = await Orders.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Orders.update({ quantity: req.body.quantity }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} not modified`)

        return res.json({ message: `${label} modified` })
    } catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Orders.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Orders.destroy({ where: { id: id }, force: true })
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

        let data = await Orders.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Orders.destroy({ where: { id: id } })
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

        let data = await Orders.restore({ where: { id: id } })
        if (!data) throw new customError('AlreadyExist', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}