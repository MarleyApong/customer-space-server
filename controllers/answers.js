const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Questions, Answers, QuestionsAnswers, Customers, AnswersCustomers, Status, Surveys, Companies, Organizations } = require('../models')
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

        // FILTER OPTION
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

        // GET ALL ANSWERS
        const data = await Answers.findAll({
            where: whereClause,
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })
        const totalElements = await Answers.count()
        if (!data) throw new customError('AnswersNotFound', `${label} not found`)

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
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Answers.findOne({ where: { id: id } })
        if (!data) throw new customError('AnswerNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        const responses = req.body
        const idCustomer = responses.length > 0 ? responses[0].idCustomer : null

        // CHECK ARRAY RESPONSES
        if (!responses || !Array.isArray(responses) || responses.length === 0) {
            throw new customError('MissingData', 'missing or invalid data')
        }

        // FIRST, CREATE CUSTOMER
        await Customers.create({ id: idCustomer })

        const answersData = await Promise.all(responses.map(async (response) => {
            const { idQuestion, note, suggestion, idCustomer } = response
            if (!idQuestion || !note) {
                throw new customError('MissingData', 'missing or invalid data')
            }

            const id = uuid()
            if (await Answers.findOne({ where: { id: id } })) {
                throw new customError('AnswerAlreadyExist', `this ${label} already exists`)
            }

            // CHECK QUESTION AFTER EACH QUESTION
            const questionData = await Questions.findOne({ where: { id: idQuestion } })
            if (!questionData) {
                throw new customError('AnswerQuestionNotFound', `${label} not created because the question with id: ${idQuestion} does not exist`)
            }

            // SECOND, CREATE ANSWERS
            const createdAnswer = await Answers.create({
                id: id,
                idQuestion: idQuestion,
                note: note,
                suggestion: suggestion
            })

            if (!createdAnswer) {
                throw new customError('AnswerNotAdd', `${label} not created`)
            }

            // THIRD, FOREIGN KEY
            await QuestionsAnswers.create({ id: uuid(), idQuestion: idQuestion, idAnswer: id })
            await AnswersCustomers.create({ id: uuid(), idAnswer: id, idCustomer: idCustomer })

            return { answer: createdAnswer }
        }))

        return res.status(201).json({ message: `${label}s created`, content: answersData })
    } 
    catch (err) {
        next(err)
    }
}

// GET ANSWERS BY ORGANIZATION
exports.getAnswersByOrganization = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await AnswersCustomers.findAll({
            group: ['idCustomer'],
            include: [
                {
                    model: Answers,
                    attributes: ['id'],
                    include: [
                        {
                            model: QuestionsAnswers,
                            attributes: ['id'],
                            include: [
                                {
                                    model: Questions,
                                    attributes: ['id', 'name'],
                                    include: [
                                        {
                                            model: Surveys,
                                            attributes: ['id', 'name'],
                                            include: [
                                                {
                                                    model: Companies,
                                                    attributes: ['id'],
                                                    include: [
                                                        {
                                                            model: Organizations,
                                                            attributes: ['id'],
                                                            where: { id: id }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })
        if (!data) throw new customError('AnswerNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}