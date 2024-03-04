const { Op } = require('sequelize')
const { Notifications, Status } = require('../models')
const customError = require('../hooks/customError')

const label = "notification"

// ROUTING RESSOURCE
// GET ALL
exports.getAll = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = parseInt(req.query.status)
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

        const data = await Notifications.findAll({
            where: whereClause,
            limit: limit,
            offset: (page - 1) * limit,
            order: [[filter, sort]],
        })
        const totalElements = await Notifications.count()
        if (!data) throw new customError('NotificationsNotFound', `${label} not found`)

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
    } 
    catch (err) {
        next(err)
    }
}

// GET ONE
exports.getOne = async (req, res, next) => {
    try {
        // GET ID OF NOTIFICATION
        const id = req.params.id
        if (!id) throw new customError('MissingParams', 'missing parameter')

        const data = await Notifications.findOne({ where: { id: id } })
        if (!data) throw new customError('NotificationNotFound', `${label} not found`)

        return res.json({ content: data })
    } 
    catch (err) {
        next(err)
    }
}

