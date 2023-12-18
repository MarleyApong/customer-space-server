const { answersCustomers } = require('../models')
const customError = require('../hooks/customError')

const label = "Assignment"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10

    try {
        const data = await answersCustomers.findAndCountAll({
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

        const data = await answersCustomers.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}