const express = require('express')
const ctrl = require('../controllers/notifications')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE COMPANIES
router.get('/', checkToken, ctrl.getAll)
router.get('/:id', checkToken, ctrl.getOne)

module.exports = router