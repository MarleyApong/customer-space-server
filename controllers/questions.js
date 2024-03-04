const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Surveys, Questions, Status } = require('../models')
const customError = require('../hooks/customError')

const label = "question"

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

        // GET ID OF STATUS
        if (status) {
            if (status !== 'actif' && status !== 'inactif') {
                whereClause.idStatus = status
            }
            else {
                const statusData = await Status.findOne({ where: { name: status } })
                whereClause.idStatus = statusData.id
            }
        }

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

        const data = await Questions.findAll({
            where: whereClause,
            include: [Surveys],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })
        const totalElements = await Questions.count()
        if (!data) throw new customError('QuestionsNotFound', `${label} not found`)

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
        // GET ID OF QUESTION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Questions.findOne({
            where: { id: id },
            include: [Surveys]
        })
        if (!data) throw new customError('ProductNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        // GET DATA FOR ADD QUESTION
        const { idSurvey, name } = req.body
        if (!idSurvey || !name) throw new customError('MissingData', 'missing data')

        // GET NEW ID FOR QUESTION
        const id = uuid()
        let data = await Questions.findOne({ where: { id: id } })
        if (data) throw new customError('QuestionAlreadyExist', `this ${label} already exists`)

        data = await Surveys.findOne({ where: { id: idSurvey } })
        if (!data) if (data) throw new customError('QuestionNotFound', `${label} not created because the survey with id: ${idSurvey} does not exist`)
        data = await Questions.create({
            id: uuid(),
            idSurvey: idSurvey,
            name: name,
        })
        if (!data) throw new customError('AddQuestionError', `${label} not created`)

        return res.status(201).json({ message: `${label} created`, content: data })
    } 
    catch (err) {
        next(err)
    }
}

// PATCH
exports.update = async (req, res, next) => {
    try {
        // GET ID OF QUESTION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')
        if (!req.body.name) throw new customError('MissingData', 'missing data')

        // CHECK THIS QUESTION
        let data = await Questions.findOne({ where: { id: id } })
        if (!data) throw new customError('QuestionNotFound', `${label} not exist`)

        data = await Questions.update({ name: req.body.name }, { where: { id: id } })
        if (!data) throw new customError('QuestionUpdateError', `${label} not modified`)

        return res.json({ message: `${label} modified` })
    } 
    catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        // GET ID OF QUESTION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS QUESTION
        let data = await Questions.findOne({ where: { id: id } })
        if (!data) throw new customError('QuestionNotFound', `${label} not exist`)

        data = await Questions.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('QuestionAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } 
    catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        // GET ID OF QUESTION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS QUESTION
        let data = await Questions.findOne({ where: { id: id } })
        if (!data) throw new customError('QuestionNotFound', `${label} not exist`)

        data = await Questions.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('QuestionAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } 
    catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        // GET ID OF QUESTION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS QUESTION
        let data = await Questions.restore({ where: { id: id } })
        if (!data) throw new customError('QuestionAlreadyRestored', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } 
    catch (err) {
        next(err)
    }
}