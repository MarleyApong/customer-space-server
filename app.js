
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const sequelize = require('./config/db')
const seedDB = require('./seeders')
require('./associations')

//GET ALL ROUTES
const errorHandler = require('./middlewares/errorHandler')
const authRouter = require('./routes/auth')
const usersRouter = require('./routes/users')
const organizationsRouter = require('./routes/organizations')
const companiesRouter = require('./routes/companies')
const surveysRouter = require('./routes/surveys')
const questionsRouter = require('./routes/questions')
const anwsersRouter = require('./routes/answers')
const customersRouter = require('./routes/customers')
const questionsAnwsersRouter = require('./routes/questionsAnswers')
const usersOrganizationsRouter = require('./routes/usersOrganizations')
const usersCompaniesRouter = require('./routes/usersCompanies')
const productsRouter = require('./routes/products')
const ordersRouter = require('./routes/orders')
const tablesRouter = require('./routes/tables')
const notificationsRouter = require('./routes/notifications')
const answersCustomersRouter = require('./routes/answersCustomers')
const rolesRouter = require('./routes/roles')
const statusRouter = require('./routes/status')
const envsRouter = require('./routes/envs')
const averagesRouter = require('./routes/averages')

// CREATE SERVER
const app = express()
const server = http.createServer(app)
const io = socketIo(server)

// MANAGER REQUEST FOR CROSS ORIGN
const corsOption = {
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Headers'],
}

// UPGRADE PROTECTION
// app.use(helmet({
//     contentSecutityPolicy: false
// }))

// CONFIGURATION API && AUTHORIZATION
app.use(cors(corsOption))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(morgan('combined'))

// INITIALIZING THE CONNEXION 'Socket.io' WITH EXPRESS
io.on('connection', (socket) => {
    console.log('New client connected');
})

// MIDDLEWARE TO ADD THE INSTANCE OF SOCKET.IO TO EACH REQUEST
app.use((req, res, next) => {
    req.io = io;
    next();
})

// STATIC IMAGES FOLDER
app.use(express.static('public'))

// ROUTES
app.get('/', (req, res) => {
    res.send('Welcome !')
})
app.use('/auth', authRouter)
app.use('/users', usersRouter)
app.use('/organizations', organizationsRouter)
app.use('/companies', companiesRouter)
app.use('/surveys', surveysRouter)
app.use('/questions', questionsRouter)
app.use('/answers', anwsersRouter)
app.use('/customers', customersRouter)
app.use('/questions-answers', questionsAnwsersRouter)
app.use('/users-organizations', usersOrganizationsRouter)
app.use('/users-companies', usersCompaniesRouter)
app.use('/products', productsRouter)
app.use('/orders', ordersRouter)
app.use('/tables', tablesRouter)
app.use('/notifications', notificationsRouter)
app.use('/answers-customers', answersCustomersRouter)
app.use('/roles', rolesRouter)
app.use('/status', statusRouter)
app.use('/envs', envsRouter)
app.use('/averages', averagesRouter)

// ROUTE NOT FOUND
app.use((req, res, next) => {
    res.status(404).send("Fuck you !")
})


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

// MANAGER ERROR
app.use(errorHandler)

// SYNCHRONISATION
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server started at address [http://localhost:${process.env.SERVER_PORT || 4000}] !`)
})