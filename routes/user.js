const express = require('express');
const router = express.Router();
const { authCheck, adminCheck } = require('../middlewares/authCheck')
const { listUsers, changeStatus, changeRole,uploadProfile ,userCart, getUserCart, emptyCart, saveAddress, saveOrder, getOrder,removeProfile ,readUser,getGroupOrder,createProfile,inputProfile } = require('../controllers/user')

router.get('/users',authCheck, adminCheck, listUsers)
router.post('/change-status', authCheck, adminCheck, changeStatus)
router.post('/change-role', authCheck, adminCheck, changeRole)
//router.get('/user/:id',authCheck,  readUser)
router.post('/user/cart', authCheck, userCart)
router.get('/user/cart', authCheck, getUserCart)
router.delete('/user/cart', authCheck, emptyCart)
router.get('/user/grouped-orders', authCheck, getGroupOrder)
router.post('/user/address', authCheck, saveAddress)

router.post('/user/order', authCheck, saveOrder)
router.get('/user/order/:id', authCheck, getOrder)
router.post('/profile',authCheck,createProfile)
router.get('/profile/:id',authCheck,inputProfile)
router.post('/removeprofile',authCheck,removeProfile)
module.exports = router