const express = require('express')
const userCtrl = require('../controllers/users')
const checkToken = require('../middlewares/jwt')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTING RESSOURCE USER
router.get('/',checkToken, userCtrl.getAllUsers)
router.get('/:id',checkToken, userCtrl.getOneUser)
router.put('/',checkToken, userCtrl.putUser)
router.patch('/:id',checkToken, userCtrl.patchUser)
router.delete('/trash/:id',checkToken, userCtrl.deleteTrashUser)
router.put('/untrash/:id',checkToken, userCtrl.untrashUser)
module.exports = router


