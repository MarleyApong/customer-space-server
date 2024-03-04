const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const multer = require('multer')
const { Organizations, Companies, Status, UsersOrganizations, Users } = require('../models')
const customError = require('../hooks/customError')

const label = "organization"

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

        // GET ID OF STASUS
        if (status) {
            if (status !== 'actif' && status !== 'inactif') {
                whereClause.idStatus = status
            }
            else {
                const statusData = await Status.findOne({ where: { name: status } })
                whereClause.idStatus = statusData.id
            }
        }

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

        // GET ALL ORGANISZATIONS
        const data = await Organizations.findAll({
            where: whereClause,
            include: [
                { model: Companies },
                {
                    model: Status,
                    attributes: ['id', 'name']
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })

        // GET TOTAL ACTIVE ORGANIZATION 
        const inProgress = await Organizations.count({
            include: [
                {
                    model: Status,
                    where: { name: 'actif' }
                }
            ]
        })

        // GET TOTAL INACTIVE ORGANIZATION
        const blocked = await Organizations.count({
            include: [
                {
                    model: Status,
                    where: { name: 'inactif' }
                }
            ]
        })

        // GET TOTAL ORGANIZATION
        const totalElements = await Organizations.count()
        if (!data) throw new customError('OrganizationsNotFound', `${label} not found`)

        return res.json({
            content: {
                data: data,
                totalPages: Math.ceil(totalElements / limit),
                currentElements: data.length,
                totalElements: totalElements,
                inProgress: inProgress,
                blocked: blocked,
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
        // GET ID OF ORGANIZATION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Organizations.findOne({
            where: { id: id },
            include: [
                { model: Companies },
                {
                    model: Status,
                    attributes: ['id', 'name']
                }
            ],
        })
        if (!data) throw new customError('OrganizationNotFound', `${label} not found`)

        return res.json({ content: data })
    }
    catch (err) {
        next(err)
    }
}

// GET ORGANIZATION BY USER
exports.getOrganizationByUser = async (req, res, next) => {
    try {
        // GET ID OF USER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Organizations.findOne({
            attributes: ['id', 'name'],
            include: [
                {
                    model: UsersOrganizations,
                    attributes: ['id'],
                    include: [
                        {
                            model: Users,
                            attributes: ['id'],
                            where: { id: id }
                        }
                    ]
                }
            ]
        })

        if (!data) throw new customError('OrganizationsNotFound', `${label} not found`)

        return res.json({ content: data })
    }
    catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        // GET DATA FOR ADD ORGANIZATION
        const { idStatus, name, description, phone, city, neighborhood } = req.body

        // GET NEW ID OF ORGANIZATION
        const id = uuid()

        // CHECK THIS DATA
        if (!idStatus || !name || !description || !phone || !city || !neighborhood) throw new customError('MissingData', 'missing data')

        let picturePath = ''
        if (req.file) {
            picturePath = req.file.path // PATH
        }

        // HERE, WE DELETE THE WORD PUBLIC IN THE PATH
        const pathWithoutPublic = picturePath.substring(6)

        let data = await Organizations.findOne({ where: { id: id } })
        if (data) throw new customError('OrganizationAlreadyExist', `this ${label} already exists`)

        data = await Organizations.create({
            id: id,
            idStatus: idStatus,
            name: name,
            description: description,
            picture: pathWithoutPublic,
            phone: phone,
            city: city,
            neighborhood: neighborhood
        })

        if (!data) throw new customError('AddOrganizationError', `${label} not created`)
        return res.status(201).json({ message: `${label} created`, content: data })
    }
    catch (err) {
        next(err)
    }
}

// PATCH
exports.update = async (req, res, next) => {
    try {
        // GET ID OF ORGANIZATION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS ORGANIZATION
        let data = await Organizations.findOne({ where: { id: id } })
        if (!data) throw new customError('OrganizationNotFound', `${label} not exist`)

        let picturePath = data.picture // PATH IMAGE DEFAULD

        if (req.file) {
            const extension = req.file.originalname.split('.').pop() // GET EXTENSION
            picturePath = `/imgs/profile/${Date.now()}_${uuid()}.${extension}` // NEW PATH

            fs.renameSync(req.file.path, `.${picturePath}`)

            if (data.picture !== picturePath) {
                fs.unlinkSync(`.${data.picture}`)
            }
        }

        const updatedData = {
            name: req.body.name,
            description: req.body.description,
            picture: picturePath,
            phone: req.body.phone,
            city: req.body.city,
            neighborhood: req.body.neighborhood
        }

        data = await Organizations.update(updatedData, { where: { id: id } })
        if (!data) throw new customError('OrganizationUpdateError', `${label} not modified`)

        return res.json({ message: `${label} modified` })
    }
    catch (err) {
        next(err)
    }
}

// PATCH IAMGE
exports.changeProfil = async (req, res, next) => {
    try {
        // GET ID OF ORGANIZATION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS ORGANIZATION
        let data = await Organizations.findOne({ where: { id: id } })
        if (!data) throw new customError('OrganizationNotFound', `${label} not exist`)

        if (req.file) {
            let data = await Organizations.findOne({ where: { id: id } })
            if (data.picture) {
                const filename = `public${data.picture}`
                fs.unlinkSync(filename)
            }

            // HERE, WE DELETE THE WORD PUBLIC IN THE PATH
            const pathWithoutPublic = req.file.path.substring(6)

            data = await Organizations.update({ picture: pathWithoutPublic }, { where: { id: id } })
            if (!data) throw new customError('PictureOrganizationUpdateError', `${label} not modified`)
            return res.json({ message: 'Picture updated' })
        }
    }
    catch (err) {
        next(err)
    }
}

// PATCH STATUS
exports.changeStatus = async (req, res, next) => {
    try {
        // GET ID OF ORGANIZATION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS ORGANIZATION
        let data = await Organizations.findOne({
            where: { id: id },
            include: [
                { model: Status }
            ]
        })

        let status = 'actif'
        if (data.Status.name === 'actif') status = 'inactif'
        data = await Status.findOne({ where: { name: status } })

        data = await Organizations.update({ idStatus: data.id }, { where: { id: id } })
        if (!data) throw new customError('StatusOrganizationUpdateError', `${label} not modified`)

        return res.json({ message: `${label} ${status === 'actif' ? 'active' : 'inactive'}` })
    }
    catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Organizations.findOne({ where: { id: id } })
        if (!data) throw new customError('OrganizationNotFound', `${label} not exist`)

        data = await Organizations.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('OrganizationAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    }
    catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        let data = await Organizations.findOne({ where: { id: id } })
        if (!data) throw new customError('OrganizationNotFound', `${label} not exist`)

        data = await Organizations.destroy({ where: { id: id } })
        if (!data) throw new customError('OrganizationAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    }
    catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        // GET ID OF ORGANIZATION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS ORGANIZATION
        let data = await Organizations.restore({ where: { id: id } })
        if (!data) throw new customError('OrganizationAlreadyRestored', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    }
    catch (err) {
        next(err)
    }
}

// IMPORT PICTURE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, './public/imgs/profile')
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