const express = require('express')
const ctrl = require('../controllers/orders')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE COMPANIES
router.get('/', checkToken, ctrl.getAll)
router.get('/:id', checkToken, ctrl.getOne)
router.get('/companies/:company/users/:user', checkToken, ctrl.getOrderByUser)
router.get('/companies/:id', checkToken, ctrl.getOrderByCompany)
router.put('/', ctrl.add)
router.patch('/:id', checkToken, ctrl.update)
router.patch('/:id/restore', checkToken, ctrl.restore)
router.delete('/:id', checkToken, ctrl.deleteTrash)

module.exports = router