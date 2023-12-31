const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const multer = require('multer')
const { Organizations, Companies } = require('../models')
const customError = require('../hooks/customError')

var label = "Organization"

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

        const data = await Organizations.findAndCountAll({
            where: whereClause,
            include: [Companies],
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

        const data = await Organizations.findOne({ 
            where: { id: id },
            include: [Companies], 
        })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        const { idStatus, name, description, phone, city, neighborhood } = req.body
        const id = uuid()
        if (!idStatus || !name || !description || !phone || !city || !neighborhood)
            throw new customError('MissingData', 'Missing Data')

        let data = await Organizations.findOne({ where: { id: id } })
        if (data) throw new customError('AlreadtExist', `This ${label} already exists`)

        let picture
        if (req.file) picture = req.file.path

        data = await Organizations.create({
            id: id,
            idStatus: idStatus,
            name: name,
            description: description,
            picture: picture,
            phone: phone,
            city: city,
            neighborhood: neighborhood
        })

        if (!data) throw new customError('BadRequest', `${label} not created`)
        return res.status(201).json({ message: `${label} created`, content: data })
    } catch (err) {
        next(err)
    }
}

// PATCH
exports.update = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await Organizations.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        if (req.file) {
            let data = await data.findOne({ where: { id: id } })
            if (data.picture) {
                const filename = data.picture
                fs.unlink(filename, (err) => {
                    if (err) throw new customError('BadRequest', err)
                    console.log(`Picture: ${filename} deleted`)
                })
            }

            data = {
                name: req.body.name,
                description: req.body.description,
                picture: req.file.path,
                phone: req.body.phone,
                city: req.body.city,
                neighborhood: body.neighborhood
            }
        }

        data = {
            name: req.body.name,
            description: req.body.description,
            phone: req.body.phone,
            city: req.body.city,
            neighborhood: req.body.neighborhood
        }

        data = await Organizations.update(data, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} not modified`)

        return res.json({ message: `${label} modified`})
    } catch (err) {
        next(err)
    }
}

// PATCH IAMGE
exports.changeProfil = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await Organizations.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        if (req.file) {
            let data = await Organizations.findOne({ where: { id: id } })
            if (data.picture) {
                const filename = data.picture
                fs.unlinkSync(filename)
            }

            data = await Organizations.update({ picture: req.file.path }, { where: { id: id } })
            if (!data) throw new customError('BadRequest', `${label} not modified`)
            return res.json({ message: 'Picture updated' })
        }
    } catch (err) {
        next(err)
    }
}

// PATCH STATUS
exports.changeStatus = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await Organizations.findOne({ where: { id: id } })
        let status = 1
        if (data.idStatus === 1) status = 2

        data = await Organizations.update({ idStatus: status }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} not modified`)

        return res.json({ message: `${label} ${status === 1 ? 'active' : 'inactive'}`})
    } catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await Organizations.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Organizations.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('AlreadyExist', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await Organizations.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Organizations.destroy({ where: { id: id } })
        if (!data) throw new customError('AlreadyExist', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'Missing Parameter')

        let data = await Organizations.restore({ where: { id: id } })
        if (!data) throw new customError('AlreadyExist', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}

// IMPORT PICTURE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, './public/imgs/profile')
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}_${file.originalname}`)
    }
})

exports.upload = multer({
    storage: storage,
    limits: { fieldSize: 100000 }
}).single('picture')
// upload()