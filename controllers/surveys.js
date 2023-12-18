const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Surveys, Users, UsersSurveys, Questions } = require('../models')
const customError = require('../hooks/customError')

const label = "Survey"

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

        const data = await Surveys.findAndCountAll({
            where: whereClause,
            include: [Questions],
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

        const data = await Surveys.findOne({ where: { id: id }, include: [Questions] })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        const { idUser, idStatus, name } = req.body
        const id = uuid()
        if (!idUser || !idStatus || !name) throw new customError('MissingData', 'Missing Data')
        let data = await Surveys.findOne({ where: { id: id } })
        if (data) throw new customError('AlreadtExist', `This ${label} already exists`)

        data = await Users.findOne({ where: { id: idUser } })
        if (!data) if (data) throw new customError('NotFound', `${label} not created because the user with id: ${idUser} does not exist`)
        data = await Surveys.create({
            id: id,
            idStatus: idStatus,
            name: name,
        })
        if (!data) throw new customError('BadRequest', `${label} not created`)

        data = await UsersSurveys.create({
            id: uuid(),
            idUser: idUser,
            idSurvey: id
        })
        if (!data) {
            await Surveys.destroy({ where: { id: id } })
            throw new customError('BadRequest', `${label} not created`)
        }

        return res.status(201).json({ message: `${label} created`, content: data })
    } catch (err) {
        next(err)
    }
}

// PATCH
exports.update = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')
        if (!req.body.name) throw new customError('MissingData', 'Missing Data')

        let data = await Surveys.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Surveys.update({ name: req.body.name }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} not modified`)

        return res.json({ message: `${label} Updated` })
    } catch (err) {
        next(err)
    }
}

// PATCH STATUS
exports.changeStatus = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await Surveys.findOne({ where: { id: id } })
        let status = 1
        if (data.idStatus === 1) status = 2

        data = await Surveys.update({ idStatus: status }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} not modified`)

        return res.json({ message: `${label} ${status === 1 ? 'active' : 'inactive'}` })
    } catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await Surveys.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Surveys.destroy({ where: { id: id }, force: true })
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
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await Surveys.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Surveys.destroy({
            where: { id: id },
            include: [Questions]
        })
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

        let data = await Surveys.restore({ where: { id: id } })
        if (!data) throw new customError('AlreadyExist', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}