const { v4: uuid } = require('uuid')
const { UsersOrganizations, Users, Organizations } = require('../models')
const customError = require('../hooks/customError')

const label = "Assignment"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10
    const status = parseInt(req.query.status)
    const sort = req.query.sort ? req.query.sort.toLowerCase() === 'asc' ? 'asc' : 'desc' : 'desc'
    const filter = req.query.filter ? req.query.filter : 'createdAt'
    const keyboard = req.query.k

    try {
        let whereClause = {}
        if (status) whereClause.idStatus = status

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

        const data = await UsersOrganizations.findAndCountAll({
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

// GET ONE
exports.getOne = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        const data = await UsersOrganizations.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}


// CREATE
exports.add = async (req, res, next) => {
    try {
        const { idUser, idOrganization } = req.body
        if (!idUser || !idOrganization) throw new customError('MissingData', 'Missing Data')
        let data = await Users.findOne({ where: { id: idUser } })
        if (!data) throw new customError('NotFound', `${label} failed because the user with id: ${idUser} does not exist`)

        data = await Organizations.findOne({ where: { id: idOrganization } })
        if (!data) if (data) throw new customError('NotFound', `${label} failed because the organization with id: ${idUser} does not exist`)
        data = await UsersOrganizations.create({
            id: uuid(),
            idUser: idUser,
            idOrganization: idOrganization
        })
        if (!data) throw new customError('BadRequest', `${label} not created`)

        await UsersOrganizations.create({
            id: uuid(),
            idUser: idUser,
            idOrganization: idOrganization
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
        const { idUser, idOrganization } = req.body
        if (!id) throw new customError('MissingParams', 'Missing Parameter')
        if (!idUser || !idOrganization) throw new customError('MissingData', 'Missing Data')

        let data = await UsersOrganizations.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} does not exist`)

        data = await UsersOrganizations.update({
            idUser: idUser,
            idOrganization: idOrganization
        }, {
            where: { id: id }
        })
        if (!data) throw new customError('BadRequest', `${label} does not modified`)

        return res.json({ message: `${label} modified` })
    } catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await UsersOrganizations.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `This ${label} does not exist`)

        data = await UsersOrganizations.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('AlreadyExist', `This ${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await UsersOrganizations.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} does not exist`)

        data = await UsersOrganizations.destroy({ where: { id: id } })
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
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await UsersOrganizations.restore({ where: { id: id } })
        if (!data) throw new customError('AlreadyExist', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}