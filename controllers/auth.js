const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')
const { Users, LogsUsers } = require('../models')
const customError = require('../hooks/customError')

exports.connect = async (req, res, next) => {

    try {
        const { email, password } = req.body
        if (!email || !password) throw customError('MissingData', 'missing data')

        const privateKey = fs.readFileSync(path.join(__dirname, "../privateKey.key"))
        const user = await Users.findOne({ where: { email: email } })
        if (!user) throw new customError('NotFound', `The user with ${email} does not exit`)

        if (user.idStatus === 2) throw new customError('AccessForbidden', `the user with ${email} have been blocked `)

        // FULL PARAMETER
        const hash = await bcrypt.compare(password, user.password)
        if (!hash) throw new customError('ProcessHashFailed', 'wrong password')

        // GENERED TOKEN
        const token = jwt.sign({}, privateKey, { expiresIn: process.env.JWT_DURING, algorithm: process.env.JWT_ALGORITHM })

        await LogsUsers.create({ id: uuid(), idUser: user.id, login: new Date().toISOString() })

        return res.json({ 
            id: user.id,
            status: user.idStatus, 
            role: user.idRole,
            env: user.idEnv,
            token: token 
        })
    }
    catch (err) {
        next(err)
    }
}