const express = require('express')
const ctrl = require('../controllers/roles')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE COMPANIES
router.get('/', checkToken, ctrl.getAll)

module.exports = router