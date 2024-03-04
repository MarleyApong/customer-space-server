const { v4: uuid } = require('uuid')
const { Roles } = require('../models')
const customError = require('../hooks/customError')

const label = "role"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    try {
        const data = await Roles.findAll()
        if (!data) throw new customError('RoleNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}