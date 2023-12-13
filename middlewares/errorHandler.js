module.exports = (err, req, res, next) => {
   let debugLevel = 0
   let debugMessage = "Limit error return by the supervisor. Contact him for more details on the problem !"
   let status = 500
   let message = "Internal server error"
   console.error('New error :', err)

   if (err.name === 'SequelizeValidationError') {
      message = 'Database connection error'
      status = 400
   }
   else if (err.name === 'MissingData') {
      message = err.message
      status = 400
   }
   else if (err.name === 'MissingParams') {
      message = err.message
      status = 400
   }
   else if (err.name === 'ProcessHashFailed') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'BadRequest') {
      message = err.message
      status = 400
   }
   else if (err.name === 'NotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'SequelizeUniqueConstraintError') {
      message = 'Single Constraint Violation'
      status = 409
   }
   else if (err.name === 'SequelizeForeignKeyConstraintError') {
      message = 'Foreign key constraint violation'
      status = 409
   }
   else if (err.name === 'SequelizeConnectionError') {
      message = 'Data validation error'
      status = 503
   }

   return res.status(status).json({ message: message, error: debugLevel === 0 ? '' : err, infos: debugLevel === 0 ? debugMessage : '' });
}