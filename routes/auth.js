const express = require('express')
const authCtrl = require('../controllers/auth')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTE
router.post('/login', authCtrl.connect)
module.exports = router