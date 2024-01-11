const express = require('express')
const ctrl = require('../controllers/users')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE USER
router.get('/',checkToken, ctrl.getAll)
router.get('/:id',checkToken, ctrl.getOne)
router.put('/',checkToken, ctrl.add)
router.patch('/:id',checkToken, ctrl.update)
router.patch('/:id/status', checkToken, ctrl.changeStatus)
router.patch('/:id/:role', checkToken, ctrl.changeRole)
router.patch('/password/:id', checkToken, ctrl.changePassword)
router.patch('/:id/restore',checkToken, ctrl.restore)
router.delete('/:id',checkToken, ctrl.deleteTrash)
module.exports = router