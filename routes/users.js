const express = require('express')
const ctrl = require('../controllers/users')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE USER
router.get('/', checkToken, ctrl.getAll)
router.get('/:id', checkToken, ctrl.getOne)
router.get('/organization-company/:id', checkToken, ctrl.getOrganizationCompanyByUser)
router.put('/', checkToken, ctrl.add)
router.patch('/:id', checkToken, ctrl.update)
router.patch('/:id/password', checkToken, ctrl.changePassword)
router.patch('/:id/status', checkToken, ctrl.changeStatus)
router.patch('/:id/:role', checkToken, ctrl.changeRole)
router.patch('/:id/restore', checkToken, ctrl.restore)
router.delete('/:id', checkToken, ctrl.deleteTrash)
module.exports = router