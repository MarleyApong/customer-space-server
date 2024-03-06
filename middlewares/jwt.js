const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

// TOKEN EXTRACTION 
const extractBearer = (authorization) => {
   if (typeof authorization !== 'string') {
      return false
   }

   // TOKEN ISOLATION
   let matches = authorization.match(/(bearer)\s+(\S+)/i)
   return matches && matches[2]
}

// TOKEN IS PRESENT ?
const checkTokenMiddleware = (req, res, next) => {
   const open = 1
   if (open === 1) {
      const token = req.headers.authorization && extractBearer(req.headers.authorization)
      if (!token) {
         return res.status(401).json({ message: 'missing token' })
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
         if (err) {
            return res.status(401).json({ message: 'bad token' })
         }
      })
   }
   next()
}

module.exports = checkTokenMiddleware