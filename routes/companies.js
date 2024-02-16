const express = require('express')
const ctrl = require('../controllers/companies')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE COMPANIES
router.get('/', checkToken, ctrl.getAll)
router.get('/:id', checkToken, ctrl.getOne)
router.get('/by-user/:id', checkToken, ctrl.getCompanyByUser)
router.get('/company/:id', checkToken, ctrl.getCompaniesByOrganization)
router.get('/page/:id', ctrl.getWebpage)
router.put('/', checkToken, ctrl.upload, ctrl.add)
router.patch('/:id', checkToken, ctrl.update)
router.patch('/:id/profile-image', checkToken, ctrl.upload, ctrl.changeProfil)
router.patch('/:id/status', checkToken, ctrl.changeStatus)
router.patch('/:id/restore', checkToken, ctrl.restore)
router.delete('/:id', checkToken, ctrl.deleteTrash)

module.exports = router