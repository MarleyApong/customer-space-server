const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Questions, Answers, QuestionsAnswers, Customers, AnswersCustomers, Status } = require('../models')
const customError = require('../hooks/customError')

const label = "answer"

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
            let statusData = await Status.findOne({ where: { name: status } })
            whereClause.idStatus = statusData.id
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

        const data = await Answers.findAll({
            where: whereClause,
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })
        const totalElements = await Answers.count()
        if (!data) throw new customError('NotFound', `${label} not found`)

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
    } catch (err) {
        next(err)
    }

}

// GET ONE
exports.getOne = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

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
        const responses = req.body
        const idCustomer = responses.length > 0 ? responses[0].idCustomer : null

        if (!responses || !Array.isArray(responses.data) || responses.length === 0) {
            throw new customError('MissingData', 'missing or invalid data')
        }

        const answersData = await Promise.all(responses.data.map(async (response) => {
            const { idQuestion, note, suggestion, idCustomer } = response
            if (!idQuestion || !note) {
                throw new customError('MissingData', 'missing or invalid data')
            }

            const id = uuid()
            if (await Answers.findOne({ where: { id: id } })) {
                throw new customError('AlreadyExist', `this answer already exists`)
            }

            const questionData = await Questions.findOne({ where: { id: idQuestion } })
            if (!questionData) {
                throw new customError('NotFound', `${label} not created because the question with id: ${idQuestion} does not exist`)
            }

            const createdAnswer = await Answers.create({
                id: id,
                idQuestion: idQuestion,
                note: note,
                suggestion: suggestion
            })

            if (!createdAnswer) {
                throw new customError('BadRequest', `${label} not created`)
            }

            await QuestionsAnswers.create({ id: uuid(), idQuestion: idQuestion, idAnswer: id })
            await AnswersCustomers.create({ id: uuid(), idAnswer: id, idCustomer: idCustomer })
            
            return { answer: createdAnswer }
        }))
        await Customers.create({ id: idCustomer })

        return res.status(201).json({ message: `${label}s created`, content: answersData })
    } catch (err) {
        next(err)
    }
}


// PATCH
exports.update = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')
        if (!req.body.name) throw new customError('MissingData', 'missing data')

        let data = await Answers.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Answers.update({ name: req.body.name }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} not modified`)

        return res.json({ message: `${label} modified` })
    } catch (err) {
        next(err)
    }
}