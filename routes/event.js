const express = require('express')
const eventEmitter = require('../hooks/eventEmitter')

// GET EXPRESS ROUTER
const router = express.Router()

// ROUTE
router.get('/order', (req, res) => {
   res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
   })

   // res.write('event: connected\n')
   // res.write('data: you are now subscribe\n')
   // res.write('id: 1\n\n')

   let counter = 0
   eventEmitter.on('event', (data) => {
      res.write('event: new_order\n')
      res.write(`data: ${data}\n`)
      res.write(`id: ${++counter}\n\n`)
   })
})
module.exports = router