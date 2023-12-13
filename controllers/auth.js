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
        if (!email || !password) throw customError('MissingDa', 'Missing data in the query')

        const privateKey = fs.readFileSync(path.join(__dirname, "../privateKey.key"))
        const user = await Users.findOne({ where: { email: email } })
        if (!user) throw customError('NotFound', `The user with ${email} does not exit`)

        // FULL PARAMETER
        const hash = await bcrypt.compare(password, user.password)
        if (!hash) throw customError('ProcessHashFailed', 'Wrong password')

        // GENERED TOKEN
        const token = jwt.sign({}, privateKey, { expiresIn: process.env.JWT_DURING, algorithm: process.env.JWT_ALGORITHM })

        await LogsUsers.create({ id: uuid(), idUser: user.id, login: new Date().toISOString() })

        return res.json({ id: user.id, access: token })
    }
    catch (err) {
        console.log(err.name); // Affiche "Error"
        console.log(err.message); // Affiche "Ceci est un exemple d'erreur."
        console.log(err.stack);
        next(err)
    }
}