module.exports = (err, req, res, next) => {

   /*
      debugLevel = 0 => JUSTE MESSAGE ON ERROR IS RETURN
      debugLevel = 1 => ALL INFORMATIONS ON ERROR
   */

   let debugLevel = 0
   let debugMessage = "Limit error return by the supervisor. Contact him for more details on the problem !"
   let status = 500
   let message = "Internal server error"
   console.error('New error :', err)

   if (err.name === 'SequelizeValidationError') {
      message = 'Database connection error'
      status = 400
   }
   else if (err.name === 'RegexPasswordValidationError') {
      message = err.message
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
   else if (err.name === 'AnswerAlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AnswerNotAdd') {
      message = err.message
      status = 400
   }
   else if (err.name === 'BadRequest') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AddSurveyError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AddCompanyError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AddStatusError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'CompanyUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'StatusUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'PictureCompanyUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'PictureOrganizationUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'StatusCompanyUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'StatusOrganizationUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'CompanyAlreadyDeleted') {
      message = err.message
      status = 400
   }
   else if (err.name === 'OrganizationAlreadyDeleted') {
      message = err.message
      status = 400
   }
   else if (err.name === 'CompanyAlreadyRestored') {
      message = err.message
      status = 400
   }
   else if (err.name === 'OrganizationAlreadyRestored') {
      message = err.message
      status = 400
   }
   else if (err.name === 'CustomerAlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'CustomerAlreadyDeleted') {
      message = err.message
      status = 400
   }
   else if (err.name === 'CustomerAlreadyRestored') {
      message = err.message
      status = 400
   }
   else if (err.name === 'OrganizationAlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AddOrganizationError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'OrganizationUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'ProductAlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'ProductUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'PictureProductUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'StatusProductUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'ProductAlreadyDeleted') {
      message = err.message
      status = 400
   }
   else if (err.name === 'ProductAlreadyRestored') {
      message = err.message
      status = 400
   }
   else if (err.name === 'QuestionAlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AddQuestionError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'QuestionUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'QuestionAlreadyDeleted') {
      message = err.message
      status = 400
   }
   else if (err.name === 'QuestionAlreadyRestored') {
      message = err.message
      status = 400
   }
   else if (err.name === 'TableAlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'TableUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'TableAlreadyDeleted') {
      message = err.message
      status = 400
   }
   else if (err.name === 'TableAlreadyRestored') {
      message = err.message
      status = 400
   }
   else if (err.name === 'UserAlreadyExist') {
      message = err.message
      status = 400
   }
   else if (err.name === 'UserUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'StatusUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'RoleUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'PasswordUserUpdateError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'UserAlreadyDeleted') {
      message = err.message
      status = 400
   }
   else if (err.name === 'UserAlreadyRestored') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AddUserError') {
      message = err.message
      status = 400
   }
   else if (err.name === 'AddLimitReached') {
      message = err.message
      status = 401
   }
   else if (err.name === 'NotAuthorizedToModified') {
      message = err.message
      status = 401
   }
   else if (err.name === 'AccessForbidden') {
      message = err.message
      status = 403
   }
   else if (err.name === 'NotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'EnvsNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'StatusNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'RoleNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'UserAutNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'AnswersNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'AnswerNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'AnswerQuestionNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'AnswersCustomersNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'CompaniesNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'CompanyNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'CustomersNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'CustomerNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'NotificationsNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'NotificationNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'OrganizationsNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'OrganizationNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'ProductsNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'ProductNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'QuestionsNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'QuestionNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'QuestionsAnswersNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'TablesNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'TableNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'UsersNotFound') {
      message = err.message
      status = 404
   }
   else if (err.name === 'UserNotFound') {
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

   return res.status(status).json({
      message: message,
      name: err.name,
      error: debugLevel === 0 ? '' : err,
      infos: debugLevel === 0 ? debugMessage : ''
   })
}