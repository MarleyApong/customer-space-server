const fs = require('fs')
const multer = require('multer')
const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Products, Users, Status, Companies, Organizations, UsersCompanies } = require('../models')
const customError = require('../hooks/customError')

const label = "product"

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

        const data = await Products.findAll({
            where: whereClause,
            include: [
                {
                    model: Companies,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Organizations,
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })
        const totalElements = await Products.count()
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

        const data = await Products.findOne({
            where: { id: id },
            include: [
                {
                    model: Companies,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Organizations,
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}

// GET PRODUCTS BY USER
exports.getProductByUser = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k

    try {
        let whereClause = {}

        if (keyboard) {
            if (filter !== 'createdAt' && filter !== 'updateAt' && filter !== 'deletedAt') {
                whereClause = {
                    ...whereClause,
                    [filter]: {
                        [Op.like]: `%${keyboard}%`
                    }
                }
            } else {
                whereClause = {
                    ...whereClause,
                    [filter]: {
                        [Op.between]: [new Date(keyboard), new Date(keyboard + " 23:59:59")]
                    }
                }
            }
        }

        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Products.findAll({
            include: [
                {
                    model: Companies,
                    include: [
                        {
                            model: UsersCompanies,
                            where: { idUser: id },
                        }
                    ]
                },
                
            ],
            where: whereClause,
            offset: (page - 1) * limit,
            limit: limit,
            order: [[filter, sort]],
        })

        const totalCount = await Products.count({
            include: [
                {
                    model: Companies,
                    include: [
                        {
                            model: UsersCompanies,
                            where: { idUser: id },
                        }
                    ]
                },
            ],
            where: whereClause
        })

        return res.json({
            totalCompanies: totalCount,
            content: {
                data: data,
                totalPages: Math.ceil(totalCount / limit),
                currentElements: data.length,
                totalElements: totalCount,
                filter: filter,
                sort: sort,
                limit: limit,
                page: page
            }
        })
    } catch (err) {
        next(err)
    }
}


// CREATE
exports.add = async (req, res, next) => {
    try {
        const { idCompany, name, price, category } = req.body
        if (!name || !price) throw new customError('MissingData', 'missing data')

        const id = uuid()
        let data = await Products.findOne({ where: { id: id } })
        if (data) throw new customError('AlreadtExist', `This ${label} already exists`)

        let picturePath = '' // INITIALIZATION OF IMAGE PATH

        console.log("req.file", req.file)
        if (req.file) {
            picturePath = req.file.path // PATH
        }

        // HERE, WE DELETE THE WORD 'PUBLIC' IN THE PATH
        const pathWithoutPublic = picturePath.substring(6)

        data = await Products.create({
            id: id,
            idCompany: idCompany,
            name: name,
            price: price,
            category: category,
            picture: pathWithoutPublic
        })

        return res.status(201).json({ message: `${label} created`, content: data })
    } catch (err) {
        next(err)
    }
}

// PATCH
exports.update = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const { name, price, category, picture } = req.body
        let data = await Products.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        console.log("body", req.body)

        const updatedFields = {
            name: name,
            price: price,
            category: category
        }

        if (req.file) {
            if (data.picture) {
                const filePath = data.picture
                fs.unlinkSync(filePath) // DELETING LAST IMAGE
            }

            const extension = req.file.originalname.split('.').pop() // RETRIEVING THE FILE EXTENSION
            const newPicturePath = `/imgs/product/${Date.now()}_${uuid()}.${extension}` // NEW PATH

            fs.renameSync(req.file.path, `.${newPicturePath}`)
            updatedFields.picture = newPicturePath // STORING THEN NEW IMAGE PATH
        }

        data = await Products.update(updatedFields, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} not modified`)

        return res.json({ message: `${label} modified` })
    } catch (err) {
        next(err)
    }
}

// PATCH PICTURE
exports.changeProfil = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Products.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        if (req.file) {
            let data = await Products.findOne({ where: { id: id } })
            if (data.picture) {
                const filename = `public${data.picture}`
                fs.unlinkSync(filename)
            }

            // HERE, WE DELETE THE WORD PUBLIC IN THE PATH
            const pathWithoutPublic = req.file.path.substring(6)

            data = await Products.update({ picture: pathWithoutPublic }, { where: { id: id } })
            if (!data) throw new customError('BadRequest', `${label} not modified`)
            return res.json({ message: 'picture updated' })
        }
    } catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Products.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Products.destroy({ where: { id: id }, force: true })
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
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Products.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Products.destroy({ where: { id: id } })
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
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Products.restore({ where: { id: id } })
        if (!data) throw new customError('AlreadyExist', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}

// IMPORT PICTURE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, './public/imgs/product')
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.split('.').pop() // RETRIEVING THE FILE EXTENSION
        const uniqueFilename = `${Date.now()}_${uuid()}.${extension}` // UNIQUE NAME
        return cb(null, uniqueFilename)
    }
})


exports.upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2Mo
}).single('picture')