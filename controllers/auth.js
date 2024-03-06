const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')
const { Users, LogsUsers, Status, Roles, Envs } = require('../models')
const customError = require('../hooks/customError')

exports.connect = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) throw customError('MissingData', 'missing data')

        const user = await Users.findOne({
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'deletedAt']
            },
            where: { email: email },
            include: [
                {
                    model: Status,
                    attributes: ['id', 'name']
                },
                {
                    model: Roles,
                    attributes: ['id', 'name']
                },
                {
                    model: Envs,
                    attributes: ['id', 'name']
                },
            ]
        })
        if (!user) throw new customError('UserAutNotFound', `the user with ${email} does not exit`)

        if (user.Status.name === 'inactif') throw new customError('AccessForbidden', `the user with ${email} have been blocked `)

        // FULL PARAMETER
        const hash = await bcrypt.compare(password, user.password)
        if (!hash) throw new customError('ProcessHashFailed', 'wrong password')

        // GENERED TOKEN
        const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_DURING, algorithm: process.env.JWT_ALGORITHM })

        await LogsUsers.create({
            id: uuid(),
            idUser: user.id,
            login: new Date().toISOString()
        })

        return res.json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                Status: {
                    id: user.Status.id,
                    name: user.Status.name
                },
                Role: {
                    id: user.Role.id,
                    name: user.Role.name
                },
                Env: {
                    id: user.Env.id,
                    name: user.Env.name
                }
            },
            token: token
        })
    }
    catch (err) {
        next(err)
    }
}