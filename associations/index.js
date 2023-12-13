const {
   Questions,
   Answers,
   Customers,
   Organizations,
   AnswersCustomers,
   Users,
   Orders,
   Status,
   Notifications,
   Tables,
   OrdersProducts,
   OrdersTables,
   Products,
   Companies,
   QuestionsAnswers,
   Surveys,
   UsersSurveys,
   Envs,
   Roles,
   LogsUsers,
   UsersOrganizations
} = require('../models')

// USER <- STATUS
Status.hasMany(Users, { foreignKey: 'idStatus' })
Users.belongsTo(Status, { foreignKey: 'idStatus' })

// USER <- ENVS
Envs.hasMany(Users, { foreignKey: 'idEnv' })
Users.belongsTo(Envs, { foreignKey: 'idEnv' })

// USER <- ROLES
Roles.hasMany(Users, { foreignKey: 'idRole' })
Users.belongsTo(Roles, { foreignKey: 'idRole' })

// USER -> LOGUSERS
Users.hasMany(LogsUsers, { foreignKey: 'idUser' })
LogsUsers.belongsTo(Users, { foreignKey: 'idUser' })

// ORGANIZATIONS -> COMPANIES
Companies.belongsTo(Organizations, { foreignKey: 'idOrganization' })
Organizations.hasMany(Companies, { foreignKey: 'idOrganization' })

// ORGANIZATIONS <- STATUS
Organizations.belongsTo(Status, { foreignKey: 'idStatus' })
Status.hasMany(Companies, { foreignKey: 'idStatus' })

// STATUS -> NOTIFICATIONS
Status.hasMany(Notifications, { foreignKey: 'idStatus' })
Notifications.belongsTo(Status, { foreignKey: 'idStatus' })

// ORDERS -> NOTIFICATIONS
Orders.hasMany(Notifications, { foreignKey: 'idOrder' })
Notifications.belongsTo(Orders, { foreignKey: 'idOrder' })

// ORDERS <- USERS
Users.hasMany(Orders, { foreignKey: 'idUser' })
Orders.belongsTo(Users, { foreignKey: 'idUser' })

// ORDERS -> TABLES
Orders.hasMany(Tables, { foreignKey: 'idOrder' })
Tables.belongsTo(Orders, { foreignKey: 'idOrder' })

// SURVEYS -> QUESTIONS
Surveys.hasMany(Questions, { foreignKey: 'idSurvey' })
Questions.belongsTo(Surveys, { foreignKey: 'idSurvey' })

// SURVEYS <- STATUS
Status.hasMany(Surveys, { foreignKey: 'idStatus' })
Surveys.belongsTo(Status, { foreignKey: 'idStatus' })

// QUESTIONS -> QUESTIONSANSWERS <- ANSWERS
Answers.hasMany(QuestionsAnswers, { foreignKey: 'idAnswer' })
Questions.hasMany(QuestionsAnswers, { foreignKey: 'idQuestion' })
QuestionsAnswers.belongsTo(Questions, { foreignKey: 'idQuestion' })
QuestionsAnswers.belongsTo(Answers, { foreignKey: 'idAnswer' })

// ANSWERS -> ANSWERSCUSTOMERS <- CUSTOMERS
Answers.hasMany(AnswersCustomers, { foreignKey: 'idAnswer' })
Customers.hasMany(AnswersCustomers, { foreignKey: 'idCustomer' })
AnswersCustomers.belongsTo(Answers, { foreignKey: 'idAnswer' })
AnswersCustomers.belongsTo(Customers, { foreignKey: 'idCustomer' })

// ORDERS -> ORDERSPRODUCTS <- PRODUCTS
Orders.hasMany(OrdersProducts, { foreignKey: 'idOrder' })
Products.hasMany(OrdersProducts, { foreignKey: 'idProduct' })
OrdersProducts.belongsTo(Orders, { foreignKey: 'idOrder' })
OrdersProducts.belongsTo(Products, { foreignKey: 'idProduct' })

// ORDERS -> ORDERSTABLES <- TABLES
Tables.hasMany(OrdersProducts, { foreignKey: 'idTable' })
Orders.hasMany(OrdersProducts, { foreignKey: 'idOrder' })
OrdersTables.belongsTo(Orders, { foreignKey: 'idOrder' })
OrdersTables.belongsTo(Tables, { foreignKey: 'idTable' })

// USERS -> USERSSURVEYS <- SURVEYS
Surveys.hasMany(UsersSurveys, { foreignKey: 'idSurvey' })
Users.hasMany(UsersSurveys, { foreignKey: 'idUser' })
UsersSurveys.belongsTo(Users, { foreignKey: 'idUser' })
UsersSurveys.belongsTo(Surveys, { foreignKey: 'idSurvey' })

// USERS -> USERSORGANIZATIONS <- ORGANIZATIONS
Users.hasMany(UsersOrganizations, { foreignKey: 'idUser' })
Organizations.hasMany(UsersOrganizations, { foreignKey: 'idOrganization' })
UsersOrganizations.belongsTo(Users, { foreignKey: 'idUser' })
UsersOrganizations.belongsTo(Organizations, { foreignKey: 'idOrganization' })
