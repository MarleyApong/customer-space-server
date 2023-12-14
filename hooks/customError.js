class customError extends Error {
   constructor(name, message) {
      super(name, message)
      this.name = name
      this.message = message
   }
}

module.exports = customError