const express = require('express')
const ctrl = require('../controllers/answers')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE COMPANIES
router.get('/', checkToken, ctrl.getAll)
router.get('/:id', checkToken, ctrl.getOne)
router.put('/', checkToken, ctrl.add)

module.exports = router