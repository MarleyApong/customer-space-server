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
   Envs,
   Roles,
   LogsUsers,
   UsersCompanies,
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
Status.hasMany(Organizations, { foreignKey: 'idStatus' })

// COMPANIES <- STATUS
Companies.belongsTo(Status, { foreignKey: 'idStatus' })
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

// ORDERS <- TABLES
Tables.hasMany(Orders, { foreignKey: 'idTable' })
Orders.belongsTo(Tables, { foreignKey: 'idTable' })

// ORDERS <- STATUS
Status.hasMany(Orders, { foreignKey: 'idStatus' })
Orders.belongsTo(Status, { foreignKey: 'idStatus' })

// COMPANIES -> TABLES
Companies.hasMany(Tables, { foreignKey: 'idCompany' })
Tables.belongsTo(Companies, { foreignKey: 'idCompany' })

// COMPANIES -> PRODUCTS
Companies.hasMany(Products, { foreignKey: 'idCompany' })
Products.belongsTo(Companies, { foreignKey: 'idCompany' })

// STATUS -> PRODUCTS
Status.hasMany(Products, { foreignKey: 'idStatus' })
Products.belongsTo(Status, { foreignKey: 'idStatus' })

// SURVEYS -> QUESTIONS
Surveys.hasMany(Questions, { foreignKey: 'idSurvey' })
Questions.belongsTo(Surveys, { foreignKey: 'idSurvey' })

// SURVEYS <- STATUS
Status.hasMany(Surveys, { foreignKey: 'idStatus' })
Surveys.belongsTo(Status, { foreignKey: 'idStatus' })

// SURVEYS <- COMPANIES
Companies.hasMany(Surveys, { foreignKey: 'idCompany' })
Surveys.belongsTo(Companies, { foreignKey: 'idCompany' })

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

// USERS -> USERSORGANIZATIONS <- ORGANIZATIONS
Users.hasMany(UsersOrganizations, { foreignKey: 'idUser' })
Organizations.hasMany(UsersOrganizations, { foreignKey: 'idOrganization' })
UsersOrganizations.belongsTo(Users, { foreignKey: 'idUser' })
UsersOrganizations.belongsTo(Organizations, { foreignKey: 'idOrganization' })

// USERS -> USERSCOMPANIES <- COMPANIES
Users.hasMany(UsersCompanies, { foreignKey: 'idUser' })
Companies.hasMany(UsersCompanies, { foreignKey: 'idCompany' })
UsersCompanies.belongsTo(Users, { foreignKey: 'idUser' })
UsersCompanies.belongsTo(Companies, { foreignKey: 'idCompany' })
