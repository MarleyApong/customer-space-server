const { Op } = require('sequelize')
const { v4: uuid } = require('uuid')
const { Surveys, Questions, Companies, Organizations, Status, UsersCompanies, Users } = require('../models')
const customError = require('../hooks/customError')

const label = "survey"

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
        if (status) {
            if (status !== 'actif' && status !== 'inactif') {
                whereClause.idStatus = status
            }
            else {
                const statusData = await Status.findOne({ where: { name: status } })
                whereClause.idStatus = statusData.id
            }
        }

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

        const data = await Surveys.findAll({
            where: whereClause,
            include: [
                { model: Questions },
                {
                    model: Companies,
                    include: [
                        Organizations
                    ]
                },
                {
                    model: Status,
                    attributes: ['id', 'name']
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })

        const inProgress = await Surveys.count({
            include: [
                {
                    model: Status,
                    where: { name: 'actif' }
                }
            ]
        })

        const blocked = await Surveys.count({
            include: [
                {
                    model: Status,
                    where: { name: 'inactif' }
                }
            ]
        })

        const totalElements = await Surveys.count()
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({
            content: {
                data: data,
                totalpages: Math.ceil(totalElements / limit),
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
    } catch (err) {
        next(err)
    }

}

// GET ONE
exports.getOne = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Surveys.findOne({
            where: { id: id },
            include: [
                { model: Questions },
                {
                    model: Companies,
                    include: [
                        Organizations
                    ]
                },
                {
                    model: Status,
                    attributes: ['id', 'name']
                }
            ],
        })
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({ content: data })
    } catch (err) {
        next(err)
    }
}

// GET SURVEYS BY USER
exports.getSurveysByUser = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status
    const sort = req.query.sort || 'desc'
    const filter = req.query.filter || 'createdAt'
    const keyboard = req.query.k


    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        // let whereClause = {}
        // if (status) {
        //     if (status !== 'actif' && status !== 'inactif') {
        //         whereClause.idStatus = status
        //     }
        //     else {
        //         const statusData = await Status.findOne({ where: { name: status } })
        //         whereClause.idStatus = statusData.id
        //     }
        // }

        // if (keyboard) {
        //     if (filter !== 'createdAt' && filter !== 'updateAt' && filter !== 'deletedAt') {
        //         whereClause = {
        //             [filter]: {
        //                 [Op.like]: `%${keyboard}%`,
        //             },
        //         }
        //     }
        //     else {
        //         whereClause = {
        //             [filter]: {
        //                 [Op.between]: [new Date(keyboard), new Date(keyboard + " 23:59:59")]
        //             },
        //         }
        //     }
        // }

        const data = await Surveys.findAll({
            include: [
                {
                    model: Status,
                    attributes: ['name']
                },
                {
                    model: Companies,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: UsersCompanies,
                            where: { idUser: id }
                        }
                    ]
                }
            ]
        })

        const inProgress = await Surveys.count({
            attributes: ['id', 'name'],
            include: [
                {
                    model: Status,
                    attributes: ['id', 'name'],
                    where: { name: 'actif' }
                },
                {
                    model: Companies,
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: UsersCompanies,
                            include: [
                                {
                                    model: Users,
                                    where: { id: id }
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        const blocked = await Surveys.count({
            include: [
                {
                    model: Status,
                    where: { name: 'inactif' }
                },
                {
                    model: Companies,
                    attributes: ['id'],
                    include: [
                        {
                            model: UsersCompanies,
                            include: [
                                {
                                    model: Users,
                                    where: { id: id }
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        const totalElements = await Surveys.count()
        if (!data) throw new customError('NotFound', `${label} not found`)

        return res.json({
            content: data,
            totalpages: Math.ceil(totalElements / limit),
            currentElements: data.length,
            totalElements: totalElements,
            inProgress: inProgress,
            blocked: blocked,
            filter: filter,
            sort: sort,
            limit: limit,
            page: page,
        })

    } catch (err) {
        next(err)
    }
}

// CREATE
exports.add = async (req, res, next) => {
    try {
        const { idCompany, idStatus, name } = req.body
        const id = uuid()

        if (!idCompany || !idStatus || !name) throw new customError('MissingData', 'missing data')
        let data = await Surveys.findOne({ where: { id: id } })
        if (data) throw new customError('AlreadyExist', `this ${label} already exists`)

        data = await Companies.findOne({ where: { id: idCompany } })
        if (!data) if (data) throw new customError('NotFound', `${label} not created because the company with id: ${idUser} does not exist`)

        // COUNT SURVEY
        const countSurvey = await Surveys.count({ where: { idCompany: idCompany } })

        if(countSurvey >= 5 ) {
            throw new customError('AddSurveyError', `the limit for surveys is set at 5`)
        }

        data = await Surveys.create({
            id: id,
            idCompany: idCompany,
            idStatus: idStatus,
            name: name,
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
        if (!id) throw new customError('MissingParams', 'missing parameter')
        if (!req.body.name) throw new customError('MissingData', 'missing data')

        let data = await Surveys.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Surveys.update({ name: req.body.name }, { where: { id: id } })
        if (!data) throw new customError('BadRequest', `${label} not modified`)

        return res.json({ message: `${label} Updated` })
    } catch (err) {
        next(err)
    }
}

// PATCH STATUS
exports.changeStatus = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const idCompany = req.body.idCompany
        if (!idCompany) throw new customError('MissingData', 'missing data')

        // CHECK COMPANY BEFORE TO CONTINIUNG
        if (await Companies.findOne({ where: { id: idCompany } })) {
            let data = await Surveys.findOne({
                where: { id: id },
                include: [
                    { model: Status }
                ]
            })

            let status = 'actif'
            if (data.Status.name === 'actif') status = 'inactif'
            const idStatus = await Status.findOne({ where: { name: status } })
            const inactiveStatus = await Status.findOne({ where: { name: 'inactif' } })

            // DESABLE ALL SURVEYS
            if (status === 'actif') {
                data = await Surveys.update({ idStatus: inactiveStatus.id }, { where: { idCompany: idCompany } })
            }

            // CHANGE STATUS
            data = await Surveys.update({ idStatus: idStatus.id }, { where: { id: id } })
            if (!data) throw new customError('BadRequest', `${label} not modified`)

            return res.json({ message: `${label} ${status === 'actif' ? 'active' : 'inactive'}` })
        }
        else {
            throw new customError('NotFound', `${label} not modified because this ${idCompany} does not exist`)
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

        let data = await Surveys.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Surveys.destroy({ where: { id: id }, force: true })
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

        let data = await Surveys.findOne({ where: { id: id } })
        if (!data) throw new customError('NotFound', `${label} not exist`)

        data = await Surveys.destroy({
            where: { id: id },
            include: [Questions]
        })
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

        let data = await Surveys.restore({ where: { id: id } })
        if (!data) throw new customError('AlreadyExist', `${label} already restored or does not exist`)

        return res.json({ message: `${label} restored` })
    } catch (err) {
        next(err)
    }
}