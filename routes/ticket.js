const express = require('express')
const router = express.Router()
const { create, list, read, updateTicket, remove, listby, searchFilters, countTicketsSold } = require('../controllers/ticket')
const { authCheck, adminCheck } =require('../middlewares/authCheck')

router.post('/ticket', create)
router.get('/tickets/:id', list)
router.get('/ticket/:id', read)
router.put('/ticket/:id',authCheck, adminCheck, updateTicket)
router.delete('/ticket/:id', remove)
router.post('/ticketby', listby)

router.get('/ticketsSold', countTicketsSold)
module.exports = router;