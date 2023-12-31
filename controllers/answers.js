const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Questions, Answers, QuestionsAnswers, Customers, AnswersCustomers } = require('../models')
const customError = require('../hooks/customError')

const label = "Answer"

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

        const data = await Answers.findAndCountAll({
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

        const data = await Answers.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        const { idQuestion, note, suggestion } = req.body
        if (!idQuestion || !note) throw new customError('MissingData', 'Missing Data')
        const id = uuid()
        const idCustomer = uuid()
        let data = await Answers.findOne({ where: { id: id } })
        if (data) throw new customError('AlreadtExist', `This ${label} already exists`)

        data = await Questions.findOne({ where: { id: idQuestion } })
        if (!data) if (data) throw new customError('NotFound', `${label} not created because the question with id: ${idQuestion} does not exist`)
        data = await Answers.create({
            id: id,
            idQuestion: idQuestion,
            note: note,
            suggestion: suggestion
        })
        if (!data) throw new customError('BadRequest', `${label} not created`)

        await QuestionsAnswers.create({
            id: uuid(),
            idQuestion: idQuestion,
            idAnswer: id
        })

        await Customers.create({
            id: idCustomer,
        })

        await AnswersCustomers.create({
            id: uuid(),
            idAnswer: id,
            idCustomer: idCustomer
        })

        return res.status(201).json({ message: `${label} created`, content: data, customer_tmp: idCustomer })
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

        let data = await Answers.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Answers.update({ name: req.body.name }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} not modified`)

        return res.json({ message: `${label} modified` })
    } catch (err) {
        next(err)
    }
}