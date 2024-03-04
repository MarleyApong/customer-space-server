const fs = require('fs')
const multer = require('multer')
const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Companies, Organizations, Surveys, Questions, Status, Users, UsersOrganizations } = require('../models')
const customError = require('../hooks/customError')

const label = "company"

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

        // GET ID OF STATUS
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

        // GET ALL COMPANIES
        const data = await Companies.findAll({
            where: whereClause,
            include: [
                {
                    model: Organizations,
                    attributes: ['id', 'name']
                },
                {
                    model: Surveys,
                    attributes: ['id', 'name']
                },
                {
                    model: Status,
                    attributes: ['id', 'name']
                },
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })

        // GET TOTAL ACTIVE COMPANIES
        const inProgress = await Companies.count({
            include: [
                {
                    model: Status,
                    where: { name: 'actif' }
                }
            ]
        })

        // GET TOTAL INACTIVE COMPANIES
        const blocked = await Companies.count({
            include: [
                {
                    model: Status,
                    where: { name: 'inactif' }
                }
            ]
        })

        // GET TOTAL COMPANIES
        const totalElements = await Companies.count()
        if (!data) throw new customError('CompaniesNotFound', `${label} not found`)

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
        // GET ID OF COMPANY
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Companies.findOne({
            where: { id: id },
            include: [
                { model: Organizations },
                { model: Surveys },
                {
                    model: Status,
                    attributes: ['id', 'name']
                },
            ],
        })
        if (!data) throw new customError('CompanyNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}

// GET COMPANIES BY USER
exports.getCompanyByUser = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k

    try {
        let whereClause = {}

        // GET ID OF STATUS
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

        // GET ID OF USER
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET TOTAL OF COMPANIES
        const totalCount = await Companies.count({
            include: [
                {
                    model: Organizations,
                    attributes: ['id'],
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
                }
            ],
            where: whereClause
        })

        // GET COMPANIES BY USER
        const userCompanies = await Companies.findAll({
            include: [
                {
                    model: Organizations,
                    attributes: ['id'],
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
                }
            ],
            where: whereClause,
            offset: (page - 1) * limit,
            limit: limit,
            order: [[filter, sort]],
        })

        return res.json({
            totalCompanies: totalCount,
            content: {
                data: userCompanies,
                totalPages: Math.ceil(totalCount / limit),
                currentElements: userCompanies.length,
                totalElements: totalCount,
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

// GET COMPANY BY ORGANIZATION
exports.getCompaniesByOrganization = async (req, res, next) => {
    try {
        // GET ID OF ORGANIZATION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // GET STATUS
        const status = req.query.status
        if (!status) new customError('MissingData', 'missing data')

        const statusData = await Status.findOne({ where: { name: status } })
        const data = await Companies.findAll({
            where: { idStatus: statusData.id },
            include: [
                {
                    model: Organizations,
                    where: { id: id }
                }
            ],
        })
        if (!data) throw new customError('CompaniesNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}

// GET WEBPAGE OF COMPANY
exports.getWebpage = async (req, res, next) => {
    try {
        // GET NAME OF WEBPAGE
        const webpage = req.params.id
        if (!webpage) throw new customError('MissingParams', 'missing parameter')

        // GET STATUS
        const status = await Status.findOne({ where: { name: 'actif' } })

        // GET COMPANY WITH THIS WEBPAGE
        const data = await Companies.findOne({
            where: { webpage: webpage },
            include: [
                {
                    model: Surveys,
                    where: { idStatus: status.id },
                    include: [
                        {
                            model: Questions
                        }
                    ]
                },
            ],
        })
        if (!data) throw new customError('CompanyNotFound', `${label} not found`)

        const page = {
            name: data.name,
            description: data.description,
            picture: data.picture,
            surveys: data.Surveys
        }

        return res.json({ content: page })
    } 
    catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        // GET DATA FOR ADD COMPANY
        const { idStatus, idOrganization, name, description, category, phone, email, city, neighborhood } = req.body

        // GET NEW ID OF COMPANY
        const id = uuid()

        // CHECK THIS DATA
        if (!idStatus || !idOrganization || !name || !description || !phone || !city || !neighborhood) throw new customError('MissingData', 'missing data')

        // CHECK, IF THIS COMPANY ALREADY EXIST BEFORE TO CONTINU
        let data = await Companies.findOne({ where: { id: id } })
        if (data) throw new customError('AlreadyExist', `this ${label} already exists`)

        // CHECK ORGANIZATION
        data = await Organizations.findOne({ where: { id: idOrganization } })
        if (!data) if (data) throw new customError('NotFound', `${label} not created because the organization with id: ${idOrganization} does not exist`)

        let picturePath = '' // INITIALIZATION OF IMAGE PATH

        if (req.file) {
            picturePath = req.file.path // PATH
        }

        // HERE, WE DELETE THE WORD 'PUBLIC' IN THE PATH
        const pathWithoutPublic = picturePath.substring(6)

        // CONVERT THE NAME TO LOWERCASE AND REMOVE SPACES
        const companyNameInLowerCaseWithoutSpaces = name.toLowerCase().replace(/\s/g, '')

        // CONCATENATE WITH THE LAST 3 CHARACTERS OF THE ID
        const namePage = companyNameInLowerCaseWithoutSpaces + id.slice(-3)

        // ADD COMPANY
        data = await Companies.create({
            id: id,
            idStatus: idStatus,
            idOrganization: idOrganization,
            name: name,
            description: description,
            picture: pathWithoutPublic,
            category: category,
            phone: phone,
            email: email,
            city: city,
            neighborhood: neighborhood,
            webpage: namePage
        })

        if (!data) {
            throw new customError('AddCompanyError', `${label} not created`)
        }

        return res.status(201).json({ message: `${label} created`, content: data })
    } 
    catch (err) {
        next(err)
    }
}

// PATCH
exports.update = async (req, res, next) => {
    try {
        // GET ID OF COMPANY
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS COMPANY
        let data = await Companies.findOne({ where: { id: id } })
        if (!data) throw new customError('CompanyNotFound', `${label} not exist`)

        // NEW DATA WITOUT PICTURE
        const updatedFields = {
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            phone: req.body.phone,
            city: req.body.city,
            neighborhood: req.body.neighborhood
        }

        // CHANGE PICTURE
        if (req.file) {
            if (data.picture) {
                const filePath = data.picture
                fs.unlinkSync(filePath) // DELETING LAST IMAGE
            }

            const extension = req.file.originalname.split('.').pop() // RETRIEVING THE FILE EXTENSION
            const newPicturePath = `/imgs/profile/${Date.now()}_${uuid()}.${extension}` // NEW PATH

            fs.renameSync(req.file.path, `.${newPicturePath}`)
            updatedFields.picture = newPicturePath // STORING THEN NEW IMAGE PATH
        }

        // UPDATE
        data = await Companies.update(updatedFields, { where: { id: id } })
        if (!data) {
            throw new customError('CompanyUpdateError', `${label} not modified`)
        }

        return res.json({ message: `${label} modified` })
    } 
    catch (err) {
        next(err)
    }
}

// PATCH PICTURE
exports.changeProfil = async (req, res, next) => {
    try {
        // GET ID OF COMPANY
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS COMPANY
        let data = await Companies.findOne({ where: { id: id } })
        if (!data) throw new customError('CompanyNotFound', `${label} not exist`)

        // CHECK, IF PICTURE EXIST
        if (req.file) {
            let data = await Companies.findOne({ where: { id: id } })
            if (data.picture) {
                const filename = `public${data.picture}`
                fs.unlinkSync(filename) // DELETE LAST PICTURE
            }

            // HERE, WE DELETE THE WORD PUBLIC IN THE PATH
            const pathWithoutPublic = req.file.path.substring(6)

            data = await Companies.update({ picture: pathWithoutPublic }, { where: { id: id } })
            if (!data) throw new customError('PictureCompanyUpdateError', `${label} not modified`)
            return res.json({ message: 'picture updated' })
        }
    } 
    catch (err) {
        next(err)
    }
}

// PATCH STATUS
exports.changeStatus = async (req, res, next) => {
    try {
        // GET ID OF COMPANY
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS COMPANY
        let data = await Companies.findOne({
            where: { id: id },
            include: [
                { model: Status }
            ]
        })

        let status = 'actif'
        if (data.Status.name === 'actif') status = 'inactif'
        data = await Status.findOne({ where: { name: status } })

        data = await Companies.update({ idStatus: data.id }, { where: { id: id } })
        if (!data) throw new customError('StatusCompanyUpdateError', `${label} not modified`)

        return res.json({ message: `${label} ${status === 'actif' ? 'active' : 'inactive'}` })
    } 
    catch (err) {
        next(err)
    }
}

// EMPTY TRASH
exports.delete = async (req, res, next) => {
    try {
        // GET ID OF COMPANY
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS COMPANY
        let data = await Companies.findOne({ where: { id: id } })
        if (!data) throw new customError('CompanyNotFound', `${label} not exist`)

        data = await Companies.destroy({ where: { id: id }, force: true })
        if (!data) throw new customError('CompanyAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } 
    catch (err) {
        next(err)
    }
}

// SAVE TRASH
exports.deleteTrash = async (req, res, next) => {
    try {
        // GET ID OF COMPANY
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS COMPANY
        let data = await Companies.findOne({ where: { id: id } })
        if (!data) throw new customError('CompanyNotFound', `${label} not exist`)

        data = await Companies.destroy({ where: { id: id } })
        if (!data) throw new customError('CompanyAlreadyDeleted', `${label} already deleted`)

        return res.json({ message: `${label} deleted` })
    } catch (err) {
        next(err)
    }
}

// UNTRASH
exports.restore = async (req, res, next) => {
    try {
        // GET ID OF COMPANY
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // CHECK THIS COMPANY
        let data = await Companies.restore({ where: { id: id } })
        if (!data) throw new customError('CompanyAlreadyRestored', `${label} already restored or does not exist`)

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
        const extension = file.originalname.split('.').pop() // RETRIEVING THE FILE EXTENSION
        const uniqueFilename = `${Date.now()}_${uuid()}.${extension}` // UNIQUE NAME
        return cb(null, uniqueFilename)
    }
})

exports.upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2Mo
}).single('picture')