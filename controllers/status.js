const { v4: uuid } = require('uuid')
const { Status } = require('../models')
const customError = require('../hooks/customError')

const label = "status"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    try {
        const data = await Status.findAll()
        if (!data) throw new customError('StatusNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        const { name } = req.body
        if (!name) throw new customError('MissingData', 'missing data')

        data = await Status.create({
            id: uuid(),
            name: name,
        })
        if (!data) throw new customError('AddStatusError', `${label} not created`)

        return res.status(201).json({ message: `${label} created`, content: data })
    } 
    catch (err) {
        next(err)
    }
}




