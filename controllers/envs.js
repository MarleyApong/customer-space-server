const { Envs } = require('../models')
const customError = require('../hooks/customError')

const label = "env"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    try {
        const data = await Envs.findAll()
        if (!data) throw new customError('EnvsNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}