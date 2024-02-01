const express = require('express')
const ctrl = require('../controllers/tables')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE COMPANIES
router.get('/', checkToken, ctrl.getAll)
router.get('/users/:id', checkToken, ctrl.getTablesByUser)
router.get('/:id', checkToken, ctrl.getOne)
router.put('/', checkToken, ctrl.add)
router.patch('/:id', checkToken, ctrl.update)
router.patch('/:id/restore', checkToken, ctrl.restore)
router.delete('/:id', checkToken, ctrl.deleteTrash)

module.exports = router