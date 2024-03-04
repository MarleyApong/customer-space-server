const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Orders, Users, OrdersProducts, Tables, Status, Companies, Notifications, Products } = require('../models')
const customError = require('../hooks/customError')
const eventEmitter = require('../hooks/eventEmitter')

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

        const data = await Orders.findOne({
            where: { id: id },
            include: [
                {
                    model: Tables,
                    attributes: ['id', 'tableNumber']
                },
                {
                    model: Status,
                    attributes: ['id', 'name']
                },
                {
                    model: OrdersProducts,
                    include: [
                        {
                            model: Products
                        }
                    ]
                },
                {
                    model: Notifications
                }
            ],
        })
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

    // GET DATE OF TODAY
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    try {
        let whereClause = {}
        let idStatus = ''
        if (status === 'actif' || status === 'inactif') {
            const statusData = await Status.findOne({ where: { name: status } })
            idStatus = statusData.id
        }

        // OPTION FILTER +
        if (!keyboard) {
            // GET DATA OF TODAY
            whereClause = {
                ...whereClause,
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            }
        }
        else {
            if (filter !== 'createdAt' && filter !== 'updatedAt' && filter !== 'deletedAt') {
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
                    createdAt: {
                        [Op.between]: [new Date(keyboard), new Date(keyboard + " 23:59:59")]
                    },
                }
            }
        }

        const id = req.params.id
        let data = ''
        let totalElements = 0

        if (status === '') {
            // GET DATA IN PROGRESS
            data = await Orders.findAll({
                where: {
                    ...whereClause,
                    idUser: null,
                    idStatus: null
                },
                include: [
                    {
                        model: Status,
                        attributes: ['id', 'name']
                    },
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
                    }
                ],
                limit: limit,
                offset: (page - 1) * limit,
                order: [[filter, sort]],
            })

            // GET TOTAL OF DATA IN PROGRESS
            totalElements = await Orders.findAll({
                where: {
                    ...whereClause,
                    idUser: null
                },
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
                    }
                ],
                limit: limit,
                offset: (page - 1) * limit,
                order: [[filter, sort]],
            })
        }
        else if (status === 'progress') {
            data = await Orders.findAll({
                where: {
                    ...whereClause,
                    idUser: {
                        [Op.not]: null
                    },
                    idStatus: null
                },
                include: [
                    {
                        model: Status,
                        attributes: ['id', 'name']
                    },
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
                    }
                ],
                limit: limit,
                offset: (page - 1) * limit,
                order: [[filter, sort]],
            })

            totalElements = await Orders.findAll({
                where: {
                    idUser: {
                        [Op.not]: null
                    },
                    ...whereClause
                },
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
                    }
                ]
            })
        }
        else {
            data = await Orders.findAll({
                where: {
                    ...whereClause,
                    idUser: {
                        [Op.not]: null
                    },
                    idStatus: idStatus
                },
                include: [
                    {
                        model: Status,
                        attributes: ['id', 'name']
                    },
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
                    }
                ],
                limit: limit,
                offset: (page - 1) * limit,
                order: [[filter, sort]],
            })

            totalElements = await Orders.findAll({
                where: {
                    ...whereClause,
                    idUser: {
                        [Op.not]: null
                    },
                    idStatus: idStatus
                },
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
                    }
                ]
            })
        }

        const activeStatus = await Status.findOne({ where: { name: 'actif' } })
        const orderFinalizedToday = await Orders.findAll({
            where: {
                ...whereClause,
                idUser: {
                    [Op.not]: null
                },
                idStatus: activeStatus.id
            },
            include: [
                {
                    model: Status,
                    attributes: ['id', 'name']
                },
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
                orderFinalizedToday: orderFinalizedToday.length,
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

        // GET TOTAL DATA OF USER IN THE COMPANY
        const status = await Status.findOne({ where: { name: 'actif' } })
        const data = await Orders.findAll({
            where: {
                idUser: user,
                idStatus: status.id
            },
            include: [
                {
                    model: Status,
                    attributes: ['id', 'name']
                },
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

        // GET DATE OF TODAY
        const today = new Date()
        const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        // GET TOTAL DATA OF TODAY OF THE COMPANY 
        const ordersToday = await Orders.findAll({
            where: {
                idUser: user,
                idStatus: status.id,
                createdAt: {
                    [Op.between]: [startDate, endDate]
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
        const { orders, idTable, webPageCompany, total } = req.body

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
        if (!data) throw new customError('TableNotFound', `${label} not created because the table does not exist`)

        // CHECK ORDER
        const id = uuid()

        data = await Orders.findOne({ where: { id: id } })
        if (data) throw new customError('AlreadyExist', `this ${label} already exists`)

        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0') // ADD 0 TO LEFT
        const day = String(today.getDate()).padStart(2, '0') // ADD 0 TO LEFT
        const formattedDate = `${year + month + day}`

        // GET LAST VALUE OF BD
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

        // ADD ORDER
        data = await Orders.create({
            id: id,
            idTable: idTable,
            name: newLastName,
            total: total
        })

        if (!data) throw new customError('BadRequest', `${label} not created`)

        const status = await Status.findOne({
            attributes: ['id'],
            where: {
                name: 'actif'
            }
        })

        // ADD NOTIFICATION OF THE ORDER
        await Notifications.create({
            id: uuid(),
            idOrder: id,
            idStatus: status.id
        })

        // ADD PRODUCTS OF THE ORDER
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

        // EMIT SIGNAL TO FRONT OF ORDER
        eventEmitter.emit('event', JSON.stringify(data.id))

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

        // EMIT SIGNAL TO FRONT OF ORDER
        eventEmitter.emit('event', JSON.stringify(data.id))

        return res.json({ message: `${label} modified` })
    } catch (err) {
        next(err)
    }
}

// UPDATE USER ID IN ORDER
exports.underTreatment = async (req, res, next) => {
    try {
        // GET ID ORDER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET ID USER
        const { user } = req.body
        if (!user) throw new customError('MissingData', 'missing data')

        let data = await Orders.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} does not exist`)

        data = await Users.findOne({ where: { id: user } })
        if (!data) throw new customError('NotFound', `${label} was not treaty because this user ${user} does not exist`)

        // GET ID STATUS ACTIVE
        const statusData = await Status.findOne({ where: { name: 'actif' } })
        data = await Notifications.update({ idStatus: statusData.id }, { where: { idOrder: id } })

        data = await Orders.update({ idUser: user }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} has not been processed`)

        // EMIT SIGNAL TO FRONT OF ORDER
        eventEmitter.emit('event', JSON.stringify(data.id))

        return res.json({ message: `${label} is under treatment` })
    } catch (err) {
        next(err)
    }
}

// CANCEL AN ORDER
exports.cancelOrder = async (req, res, next) => {
    try {
        // GET ID ORDER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET ID USER
        const { user } = req.body
        if (!user) throw new customError('MissingData', 'missing data')

        // GET ID STATUS INACTIVE
        const statusData = await Status.findOne({ where: { name: 'inactif' } })

        let data = await Orders.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} does not exist`)

        data = await Users.findOne({ where: { id: user } })
        if (!data) throw new customError('NotFound', `${label} was not canceled because this user ${user} does not exist`)

        data = await Orders.update({ idUser: user, idStatus: statusData.id }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} has not been canceled`)

        // EMIT SIGNAL TO FRONT OF ORDER
        eventEmitter.emit('event', JSON.stringify(data.id))

        return res.json({ message: `${label} canceled` })
    } catch (err) {
        next(err)
    }
}

// FINALIZED THE ORDER
exports.finalizeOrder = async (req, res, next) => {
    try {
        // GET ID ORDER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET ID USER
        const { user } = req.body
        if (!user) throw new customError('MissingData', 'missing data')

        // GET ID STATUS ACTIVE
        const statusData = await Status.findOne({ where: { name: 'actif' } })

        let data = await Orders.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} does not exist`)

        data = await Users.findOne({ where: { id: user } })
        if (!data) throw new customError('NotFound', `${label} was not finalized because this user ${user} does not exist`)

        // CHECK, IF USER TOOK THE ORDER IN FIRST 
        data = await Orders.findOne({
            where: {
                id: id,
                idUser: user
            }
        })
        if (!data) throw new customError('NotAuthorizedToModified', `${label} was not canceled because this user ${user} is not authorized`)

        data = await Orders.update({ idUser: user, idStatus: statusData.id }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} has not been finalized`)

        // EMIT SIGNAL TO FRONT OF ORDER
        eventEmitter.emit('event', JSON.stringify(data.id))

        return res.json({ message: `${label} finalized` })
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