const express = require('express')
const ctrl = require('../controllers/averages')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE COMPANIES
router.get('/questions/:id', checkToken, ctrl.averageQuestion)
router.get('/surveys/:id', checkToken, ctrl.averageSurvey)
router.get('/companies/min-max', checkToken, ctrl.minMaxAverage)
router.get('/surveys/min-max/users/:id', checkToken, ctrl.minMaxAverageSurveys)
router.get('/companies/:id', checkToken, ctrl.averageCompany)

module.exports = router