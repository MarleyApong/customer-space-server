const { Op } = require('sequelize')
const { Customers, Answers, AnswersCustomers, QuestionsAnswers, Questions, Surveys, Companies, UsersCompanies, Users, Organizations } = require('../models')
const customError = require('../hooks/customError')

const label = "customer"

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

        const data = await Customers.findAll({
            // attributes: [],
            include: [
                {
                    model: AnswersCustomers,
                    include: [
                        {
                            model: Answers,
                            attributes: ['note', 'suggestion'],
                            include: [
                                {
                                    model: QuestionsAnswers,
                                    attributes: ['id'],
                                    include: [
                                        {
                                            model: Questions,
                                            attributes: ['name'],
                                            include: [
                                                {
                                                    model: Surveys,
                                                    attributes: ['name'],
                                                    include: [
                                                        {
                                                            model: Companies,
                                                            attributes: ['name'],
                                                            include: [
                                                                {
                                                                    model: Organizations,
                                                                    attributes: ['name']
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
                }
            ],
            where: {
                name: {
                    [Op.not]: null,
                },
                ...whereClause
            },
            offset: (page - 1) * limit,
            limit: limit,
            order: [[filter, sort]],
        })

        const totalElements = await Customers.count({
            where: {
                name: {
                    [Op.not]: null,
                }
            }
        })
        if (!data) throw new customError('CustomersNotFound', `${label} not found`)

        const formattedData = data.map(customer => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            createdAt: customer.createdAt,
            survey: customer.Answers_Customers[0].Answer.Questions_Answers[0].Question.Survey.name,
            company: customer.Answers_Customers[0].Answer.Questions_Answers[0].Question.Survey.Company.name,
            organization: customer.Answers_Customers[0].Answer.Questions_Answers[0].Question.Survey.Company.Organization.name,
            questions: customer.Answers_Customers.map(answerCustomer => ({
                name: answerCustomer.Answer.Questions_Answers[0].Question.name,
                reponses: [
                    {
                        note: answerCustomer.Answer.note,
                        suggestion: answerCustomer.Answer.suggestion
                    }
                ]
            }))
        }))

        return res.json({
            content: {
                data: formattedData,
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
        // GET ID OF CUSTOMER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Customers.findOne({
            // attributes: [],
            include: [
                {
                    model: AnswersCustomers,
                    include: [
                        {
                            model: Answers,
                            attributes: ['note', 'suggestion'],
                            include: [
                                {
                                    model: QuestionsAnswers,
                                    attributes: ['id'],
                                    include: [
                                        {
                                            model: Questions,
                                            attributes: ['name'],
                                            include: [
                                                {
                                                    model: Surveys,
                                                    attributes: ['name'],
                                                    include: [
                                                        {
                                                            model: Companies,
                                                            attributes: ['name'],
                                                            include: [
                                                                {
                                                                    model: Organizations,
                                                                    attributes: ['name']
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
                }
            ],
            where: {
                id: id,
                name: {
                    [Op.not]: null,
                },
            }
        })
        if (!data) throw new customError('CustomerNotFound', `${label} not found`)

        const formattedData = {
            id: data.id,
            name: data.name,
            phone: data.phone,
            createdAt: data.createdAt,
            survey: data.Answers_Customers[0].Answer.Questions_Answers[0].Question.Survey.name,
            company: data.Answers_Customers[0].Answer.Questions_Answers[0].Question.Survey.Company.name,
            organization: data.Answers_Customers[0].Answer.Questions_Answers[0].Question.Survey.Company.Organization.name,
            questions: data.Answers_Customers.map(answerCustomer => ({
                name: answerCustomer.Answer.Questions_Answers[0].Question.name,
                note: answerCustomer.Answer.note,
                suggestion: answerCustomer.Answer.suggestion
            }))
        }

        return res.json({ content: formattedData })

    } 
    catch (err) {
        next(err)
    }
}

// GET TABLES BY USER
exports.getCustomerByUser = async (req, res, next) => {
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
                        [Op.like]: `%${keyboard}%`
                    }
                }
            } 
            else {
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

        const data = await Customers.findAll({
            // attributes: [],
            include: [
                {
                    model: AnswersCustomers,
                    include: [
                        {
                            model: Answers,
                            attributes: ['note', 'suggestion'],
                            include: [
                                {
                                    model: QuestionsAnswers,
                                    attributes: ['id'],
                                    include: [
                                        {
                                            model: Questions,
                                            attributes: ['name'],
                                            include: [
                                                {
                                                    model: Surveys,
                                                    attributes: ['name'],
                                                    include: [
                                                        {
                                                            model: Companies,
                                                            attributes: ['name'],
                                                            include: [
                                                                {
                                                                    model: UsersCompanies,
                                                                    attributes: ['id'],
                                                                    include: [
                                                                        {
                                                                            model: Users,
                                                                            where: {id: id},
                                                                            attributes: ['id']
                                                                        }
                                                                    ]
                                                                },
                                                                {
                                                                    model: Organizations,
                                                                    attributes: ['name']
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
                }
            ],
            where: {
                name: {
                    [Op.not]: null,
                },
                ...whereClause
            },
            offset: (page - 1) * limit,
            limit: limit,
            order: [[filter, sort]],
        })
        
        const countCustomer = await Customers.findAll({
            // attributes: [],
            include: [
                {
                    model: AnswersCustomers,
                    include: [
                        {
                            model: Answers,
                            attributes: ['note', 'suggestion'],
                            include: [
                                {
                                    model: QuestionsAnswers,
                                    attributes: ['id'],
                                    include: [
                                        {
                                            model: Questions,
                                            attributes: ['name'],
                                            include: [
                                                {
                                                    model: Surveys,
                                                    attributes: ['name'],
                                                    include: [
                                                        {
                                                            model: Companies,
                                                            attributes: ['name'],
                                                            include: [
                                                                {
                                                                    model: UsersCompanies,
                                                                    attributes: ['id'],
                                                                    include: [
                                                                        {
                                                                            model: Users,
                                                                            where: {id: id},
                                                                            attributes: ['id']
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
                        }
                    ]
                }
            ],
            where: {
                name: {
                    [Op.not]: null,
                },
            }
        })
        
        const formattedData = data.map(customer => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            createdAt: customer.createdAt,
            survey: customer.Answers_Customers[0].Answer.Questions_Answers[0].Question.Survey.name,
            company: customer.Answers_Customers[0].Answer.Questions_Answers[0].Question.Survey.Company.name,
            organization: customer.Answers_Customers[0].Answer.Questions_Answers[0].Question.Survey.Company.Organization.name,
            questions: customer.Answers_Customers.map(answerCustomer => ({
                name: answerCustomer.Answer.Questions_Answers[0].Question.name,
                reponses: [
                    {
                        note: answerCustomer.Answer.note,
                        suggestion: answerCustomer.Answer.suggestion
                    }
                ]
            }))
        }))

        const totalElements = await Customers.count({
            where: {
                name: {
                    [Op.not]: null,
                }
            }
        })

        return res.json({
            content: {
                data: formattedData,
                totalpages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements,
                totalCutomerByUser: countCustomer.length,
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

// UPDATE
exports.update = async (req, res, next) => {
    try {
        const idCustomer = req.params.id
        if (!idCustomer) throw new customError('MissingParams', 'missing parameter')

        const { name, phone } = req.body
        if (!name || !phone) throw new customError('MissingData', 'missing data')

        // CHECK CUSTOMER
        let data = await Customers.findOne({ where: { id: idCustomer } })
        if (!data) throw new customError('CustomerAlreadyExist', `this ${label} does not exist`)

        data = await Customers.update({ name: name, phone: phone },
            { where: { id: idCustomer } }
        )
        if (!data) throw new customError('CompanyUpdateError', `${label} not updated`)

        return res.status(201).json({ message: `${label} updated`, content: data })
    } 
    catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        // GET ID OF CUSTOMER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK CUSTOMER
        let data = await Customers.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Customers.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('CustomerAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        // GET ID OF CUSTOMER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK CUSTOMER
        let data = await Customers.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Customers.destroy({ where: { id: id }})
        if (!data) throw new customError('CustomerAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        // GET ID OF CUSTOMER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK CUSTOMER
        let data = await Customers.restore({ where: { id: id } })
        if (!data) throw new customError('CustomerAlreadyRestored', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } 
    catch (err) {
        next(err)
    }
}