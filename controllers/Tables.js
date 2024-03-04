
const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Tables, Companies, Organizations, UsersCompanies } = require('../models')
const customError = require('../hooks/customError')

const label = "table"

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

        // OPTION FILTER
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

        const data = await Tables.findAll({
            where: whereClause,
            include: [
                {
                    model: Companies,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Organizations,
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })
        const totalElements = await Tables.count()
        if (!data) throw new customError('TablesNotFound', `${label} not found`)

        return res.json({
            content: {
                data: data,
                totalpages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements,
                filter: filter,
                sort: sort,
                limit: limit,
                page: page,
            }
        })
    }
    catch (err) {
        next(err)
    }

}

// GET ONE
exports.getOne = async (req, res, next) => {
    try {
        // GET ID OF TABLE
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Tables.findOne({
            where: { id: id },
            include: [
                {
                    model: Companies,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Organizations,
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        })
        if (!data) throw new customError('TableNotFound', `${label} not found`)

        return res.json({ content: data })
    }
    catch (err) {
        next(err)
    }
}

// GET TABLES BY USER
exports.getTablesByUser = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k

    try {
        let whereClause = {}

        // FILTER OPTION
        if (keyboard) {
            if (filter !== 'createdAt' && filter !== 'updateAt' && filter !== 'deletedAt') {
                whereClause = {
                    ...whereClause,
                    [filter]: {
                        [Op.like]: `%${keyboard}%`
                    }
                }
            } else {
                whereClause = {
                    ...whereClause,
                    [filter]: {
                        [Op.between]: [new Date(keyboard), new Date(keyboard + " 23:59:59")]
                    }
                }
            }
        }

        // GET ID OF USER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Tables.findAll({
            include: [
                {
                    model: Companies,
                    include: [
                        {
                            model: UsersCompanies,
                            where: { idUser: id },
                        }
                    ]
                },

            ],
            where: whereClause,
            offset: (page - 1) * limit,
            limit: limit,
            order: [[filter, sort]],
        })
        if (!data) throw new customError('TableNotFound', `${label} not found`)

        const totalCount = await Tables.count({
            include: [
                {
                    model: Companies,
                    include: [
                        {
                            model: UsersCompanies,
                            where: { idUser: id },
                        }
                    ]
                },
            ],
            where: whereClause
        })

        return res.json({
            totalCompanies: totalCount,
            content: {
                data: data,
                totalPages: Math.ceil(totalCount / limit),
                currentElements: data.length,
                totalElements: totalCount,
                filter: filter,
                sort: sort,
                limit: limit,
                page: page
            }
        })
    }
    catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        // GET DATA FOR ADD TABLE
        const { idCompany, tableNumber } = req.body
        if (!idCompany || !tableNumber) throw new customError('MissingData', 'missing data')

        // GET NEW ID FOR TABLE
        const id = uuid()
        let data = await Tables.findOne({
            include: [
                {
                    model: Companies,
                    attributes: ['id'],
                    where: {
                        id: idCompany
                    }
                }
            ],
            where: {
                tableNumber: tableNumber
            }
        })
        if (data) throw new customError('TableAlreadyExist', `this ${label} already exists`)

        data = await Companies.findOne({
            attributes: ['id', 'name', 'webpage'],
            where: { id: idCompany },
            include: [
                {
                    model: Organizations,
                    attributes: ['id', 'name']
                }
            ]
        })

        const organization = data.Organization.id
        const company = data.webpage
        const webPage = `${organization}/${company}?fkpngt44tdot=${id}`


        data = await Tables.create({
            id: id,
            idCompany: idCompany,
            tableNumber: tableNumber,
            webPage: webPage
        })

        return res.status(201).json({ message: `${label} created`, content: data })
    }
    catch (err) {
        next(err)
    }
}

// PATCH
exports.update = async (req, res, next) => {
    try {
        // GET ID OF TABLE
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET NEW DATA
        const { idCompany, tableNumber } = req.body
        let data = await Tables.findOne({
            include: [
                {
                    model: Companies,
                    attributes: ['id'],
                    where: {
                        id: idCompany
                    }
                }
            ],
            where: {
                tableNumber: tableNumber
            }
        })
        if (data) throw new customError('TableAlreadyExist', `this ${label} already exists`)

        data = await Tables.update({ tableNumber: tableNumber }, { where: { id: id } })
        if (!data) throw new customError('TableUpdateError', `${label} not modified`)

        return res.json({ message: `${label} modified` })
    }
    catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        // GET ID OF TABLE
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS TABLE
        let data = await Tables.findOne({ where: { id: id } })
        if (!data) throw new customError('TableNotFound', `${label} not exist`)

        data = await Tables.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('TableAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    }
    catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        // GET ID OF TABLE
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS TABLE
        let data = await Tables.findOne({ where: { id: id } })
        if (!data) throw new customError('TableNotFound', `${label} not exist`)

        data = await Tables.destroy({ where: { id: id } })
        if (!data) throw new customError('TableAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    }
    catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        // GET ID OF TABLE
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS TABLE
        let data = await Tables.restore({ where: { id: id } })
        if (!data) throw new customError('TableAlreadyRestored', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } 
    catch (err) {
        next(err)
    }
}