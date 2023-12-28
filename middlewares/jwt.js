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
      const privateKey = fs.readFileSync(path.join(__dirname, "../privateKey.key"))
      if (!token) {
         return res.status(401).json({ message: 'Missing token' })
      }

      jwt.verify(token, privateKey, (err, decodedToken) => {
         console.log('token decode: ', decodedToken);
         if (err) {
            return res.status(401).json({ message: 'Bad token' })
         }
      })
   }
   next()
}

module.exports = checkTokenMiddleware