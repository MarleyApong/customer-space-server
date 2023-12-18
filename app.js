const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const sequelize = require('./config/db')
const seedDB = require('./seeders')
require('./associations')
const errorHandler = require('./middlewares/errorHandler')
const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')
const organizationsRouter = require('./routes/organizations')
const companiesRouter = require('./routes/companies')
const surveysRouter = require('./routes/surveys')
const usersSurveysRouter = require('./routes/usersSurveys')
const questionsRouter = require('./routes/questions')
const anwsersRouter = require('./routes/answers')
const questionsAnwsersRouter = require('./routes/questionsAnswers')
const usersOrganizationsRouter = require('./routes/usersOrganizations')
const productsRouter = require('./routes/products')
const ordersRouter = require('./routes/orders')
const tablesRouter = require('./routes/tables')
const notificationsRouter = require('./routes/notifications')
const answersCustomersRouter = require('./routes/answersCustomers')

const app = express()
const corsOption = {
    origin: '*'
}

// UPGRADE PROTECTION
app.use(helmet({
    // contentSecutityPolicy: false
}))

// CONFIGURATION API && AUTHORIZATION
app.use(cors(corsOption))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('combined'))

// STATIC IMAGES FOLDER
app.use('/images', express.static('./public/images/profil'))

// ROUTES
app.get('/', (req, res) => {
    res.send('Welcome !')
})
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/organizations', organizationsRouter)
app.use('/companies', companiesRouter)
app.use('/surveys', surveysRouter)
app.use('/users-surveys', usersSurveysRouter)
app.use('/questions', questionsRouter)
app.use('/answers', anwsersRouter)
app.use('/questions-answers', questionsAnwsersRouter)
app.use('/users-organizations', usersOrganizationsRouter)
app.use('/products', productsRouter)
app.use('/orders', ordersRouter)
app.use('/tables', tablesRouter)
app.use('/notifications', notificationsRouter)
app.use('/answers-customers', answersCustomersRouter)

// SYNCHRONIZATION
const init = async () => {
    try {
        await sequelize.sync({ alter: true })
        console.log("All models have been successfully synced !")

        await seedDB()
        console.log("Tables have been initialized by defaut !")
    } catch (err) {
        console.error("Error during initialization: ", err)
    }
}
init()

// NOT FOUND
app.use((req, res, next) => {
    res.status(404).send("Fuck you !")
})

// MANAGER ERROR
app.use(errorHandler)

// SYNCHRONISATION
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server started at address [http://localhost:${process.env.SERVER_PORT || 4000}] !`)
})