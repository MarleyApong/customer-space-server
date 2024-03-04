const { QuestionsAnswers, Questions, Surveys, Companies, Answers } = require('../models')
const customError = require('../hooks/customError')

const label = "question-answers"

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

        const data = await QuestionsAnswers.findAll({
            where: whereClause,
            include: [
                {
                    model: Questions,
                    attributes: { exclude: ['updatedAt', 'deletedAt'] },
                    include: [
                        {
                            model: Surveys,
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                            include: [
                                {
                                    model: Companies,
                                    attributes: ['id', 'idOrganization', 'idStatus', 'name'],
                                }
                            ]
                        }
                    ]
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })
        const totalElements = await QuestionsAnswers.count()
        if (!data) throw new customError('QuestionsAnswersNotFound', `${label} not found`)

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

        const data = await QuestionsAnswers.findOne({ where: { id: id } })
        if (!data) throw new customError('QuestionsAnswersNotFound', `${label} not found`)

        return res.json({ content: data })
    }
    catch (err) {
        next(err)
    }
}

// GET BY QUESTION
exports.getByQuestion = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k

    try {
        // GET ID OF QUESTION
        const id = req.params.id
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

        if (!id) {
            throw new customError('MissingParams', 'missing question ID parameter')
        }

        const data = await QuestionsAnswers.findAll({
            attributes: { exclude: ['id', 'idAnswer', 'updatedAt', 'deletedAt'] },
            include: [
                {
                    model: Questions,
                    where: { id: id }
                },
                {
                    model: Answers,
                    attributes: { exclude: ['id', 'updatedAt', 'deletedAt'] },
                }
            ],
            where: whereClause,
            limit: limit,
            offset: (page - 1) * limit
        })

        const totalElements = await QuestionsAnswers.count()
        if (!data) {
            throw new customError('QuestionsAnswersNotFound', `${label} not found`)
        }

        return res.json({
            content: {
                data: data,
                totalpages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements,
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
