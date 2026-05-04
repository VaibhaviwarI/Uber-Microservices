const express = require('express')

const router = express.Router();

const captainController = require('../controllers/captain.controller')

const authMiddleware = require('../middleware/auth.middleware')


router.post('/register', captainController.register)
router.post('/login', captainController.logIn)
router.post('/logout', authMiddleware.captainAuth, captainController.logOut)
router.get('/profile', authMiddleware.captainAuth, captainController.profile)
router.patch('/toggle-availability', authMiddleware.captainAuth, captainController.toggleAvailability);



module.exports = router