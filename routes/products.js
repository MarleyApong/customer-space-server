const express = require('express')
const ctrl = require('../controllers/products')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE COMPANIES
router.get('/', checkToken, ctrl.getAll)
router.get('/users/:id', checkToken, ctrl.getProductByUser)
router.get('/companies/:id', ctrl.getProductByCompany)
router.get('/:id', checkToken, ctrl.getOne)
router.put('/', checkToken, ctrl.upload, ctrl.add)
router.patch('/:id', checkToken, ctrl.update)
router.patch('/:id/profile-image', checkToken, ctrl.upload, ctrl.changeProfil)
router.patch('/:id/status', checkToken, ctrl.changeStatus)
router.patch('/:id/restore', checkToken, ctrl.restore)
router.delete('/:id', checkToken, ctrl.deleteTrash)

module.exports = router