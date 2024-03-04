const { AnswersCustomers } = require('../models')
const customError = require('../hooks/customError')

const label = "assignment"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    try {
        const data = await AnswersCustomers.findAll({
            limit: limit,
            offset: (page - 1) * limit,
        })
        const totalElements = await AnswersCustomers.count()
        if (!data) throw new customError('AnswersCustomersNotFound', `${label} not found`)

        return res.json({
            content: {
                data: data,
                totalpages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements,
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

        const data = await AnswersCustomers.findOne({ where: { id: id } })
        if (!data) throw new customError('AnswersCustomersNotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}