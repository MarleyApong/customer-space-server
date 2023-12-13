const express = require('express')
const ctrl = require('../controllers/organizations')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE COMPANIES
router.get('/', checkToken, ctrl.getAll)
router.get('/:id', checkToken, ctrl.getOne)
router.put('/', checkToken, ctrl.upload, ctrl.insert)
router.patch('/update/:id', checkToken, ctrl.update)
router.patch('/update/picture/:id', checkToken, ctrl.updateProfil)
router.patch('/status/:id', checkToken, ctrl.updateStatus)
router.delete('/:id', checkToken, ctrl.delete)
router.delete('/trash/:id', checkToken, ctrl.deleteTrash)
router.put('/untrash/:id', checkToken, ctrl.untrash)

module.exports = router