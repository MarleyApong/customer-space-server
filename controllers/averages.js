const { QuestionsAnswers, Questions, Surveys, Companies, Answers, Organizations, UsersOrganizations, Users } = require('../models')

// CALCULATE THE AVERAGE OF ANSWERS TO A QUESTION
exports.averageQuestion = async (req, res, next) => {
   const id = req.params.id

   try {
      const data = await QuestionsAnswers.findAll({
         where: { idQuestion: id },
         include: [{ model: Answers }]
      })

      if (!data) {
         const average = 0
         return res.json({ average })
      }
      else {
         const totalNotes = data.length > 0 ? data.reduce((sum, answer) => sum + answer.Answer.note, 0) : 0
         const average = data.length > 0 ? (totalNotes / data.length).toFixed(3) : 0
         return res.json({ average })
      }

   } 
   catch (err) {
      next(err)
   }
}

// CALCULATE THE AVERAGE OF ANSWERS TO A SURVEY
exports.averageSurvey = async (req, res, next) => {
   const id = req.params.id

   try {
      const data = await Surveys.findAll({
         where: { id: id },
         attributes: ['id'],
         include: [
            {
               model: Questions,
               attributes: ['id'],
               include: [
                  {
                     model: QuestionsAnswers,
                     attributes: ['id'],
                     include: [
                        {
                           model: Answers,
                           attributes: ['id', 'note']
                        }
                     ]
                  }
               ]
            }
         ]
      })

      if (!data) {
         const average = 0
         return res.json({ average })
      }
      else {
         const notes = data.flatMap(survey =>
            survey.Questions.flatMap(question =>
               question.Questions_Answers.flatMap(qa =>
                  qa.Answer.note
               )
            )
         )

         const totalNotes = notes.reduce((sum, note) => sum + note, 0)
         const average = notes.length > 0 ? (totalNotes / notes.length).toFixed(3) : 0

         return res.json({ average })
      }
   } catch (err) {
      next(err)
   }
}

// CALCULATE THE AVERAGE OF ANSWERS FOR A COMPANY
exports.averageCompany = async (req, res, next) => {
   const id = req.params.id

   try {
      const data = await Companies.findAll({
         where: { id: id },
         attributes: ['id'],
         include: [
            {
               model: Surveys,
               attributes: ['id'],
               include: [
                  {
                     model: Questions,
                     attributes: ['id'],
                     include: [
                        {
                           model: QuestionsAnswers,
                           attributes: ['id'],
                           include: [
                              {
                                 model: Answers,
                                 attributes: ['id', 'note']
                              }
                           ]
                        }
                     ]
                  }
               ]
            }
         ]
      })

      if (!data) {
         const average = 0
         return res.json({ average })
      }
      else {
         const notes = data.flatMap(company =>
            company.Surveys.flatMap(survey =>
               survey.Questions.flatMap(question =>
                  question.Questions_Answers.flatMap(qa =>
                     qa.Answer.note
                  )
               )
            )
         )

         const totalNotes = notes.reduce((sum, note) => sum + note, 0)
         const average = notes.length > 0 ? (totalNotes / notes.length).toFixed(3) : 0

         return res.json({ average })
      }
   } catch (err) {
      next(err)
   }
}

// RETURNS THE COMPANY WITH THE HIGHEST AND LOWEST AVERAGE
exports.minMaxAverage = async (req, res, next) => {
   try {
      // Get all companies
      const companies = await Companies.findAll()

      // Initialize variables to store the company with the highest and lowest average
      let maxCompany = null
      let minCompany = null
      let maxAverage = -Infinity
      let minAverage = Infinity

      // Iterate through each company
      for (const company of companies) {
         const id = company.id

         // Get data associated with the company
         const data = await Companies.findAll({
            where: { id: id },
            attributes: ['id'],
            include: [
               {
                  model: Surveys,
                  attributes: ['id'],
                  include: [
                     {
                        model: Questions,
                        attributes: ['id'],
                        include: [
                           {
                              model: QuestionsAnswers,
                              attributes: ['id'],
                              include: [
                                 {
                                    model: Answers,
                                    attributes: ['id', 'note']
                                 }
                              ]
                           }
                        ]
                     }
                  ]
               }
            ]
         })

         // if (!data || data.length === 0) {
         //   throw new customError('NotFound', `No answers found for company ${id}`)
         // }

         // Calculate the average
         const notes = data.flatMap(company =>
            company.Surveys.flatMap(survey =>
               survey.Questions.flatMap(question =>
                  question.Questions_Answers.flatMap(qa =>
                     qa.Answer.note
                  )
               )
            )
         )

         const totalNotes = notes.reduce((sum, note) => sum + note, 0)
         const average = notes.length > 0 ? (totalNotes / notes.length).toFixed(3) : 0

         // Update the company with the highest average
         if (average > maxAverage) {
            maxAverage = average
            maxCompany = company
         }

         // Update the company with the lowest average
         if (average < minAverage) {
            minAverage = average
            minCompany = company
         }
      }

      return res.json({
         maxCompany: {
            id: maxCompany.id,
            name: maxCompany.name,
            average: maxAverage
         },
         minCompany: {
            id: minCompany.id,
            name: minCompany.name,
            average: minAverage
         }
      })
   } 
   catch (err) {
      next(err)
   }
}

// RETURNS THE SURVEY WITH THE HIGHEST AND LOWEST AVERAGE
exports.minMaxAverageSurveys = async (req, res, next) => {
   try {
      const id = req.params.id
      // Get all surveys
      const surveys = await Surveys.findAll({
         include: [
            {
               model: Companies,
               attributes: ['id', 'name'],
               include: [
                  {
                     model: Organizations,
                     attributes: ['id'],
                     include: [
                        {
                           model: UsersOrganizations,
                           attributes: ['id'],
                           include: [
                              {
                                 model: Users,
                                 attributes: ['id'],
                                 where: { id: id }
                              }
                           ]
                        }
                     ]
                  }
               ]
            }
         ]
      })

      // Initialize variables to store the survey with the highest and lowest average
      let maxSurvey = null
      let minSurvey = null
      let maxAverage = -Infinity
      let minAverage = Infinity

      // Iterate through each survey
      for (const survey of surveys) {
         const id = survey.id

         // Get data associated with the survey
         const data = await Surveys.findAll({
            attributes: ['id'],
            where: { id: id },
            include: [
               {
                  model: Questions,
                  attributes: ['id'],
                  include: [
                     {
                        model: QuestionsAnswers,
                        attributes: ['id'],
                        include: [
                           {
                              model: Answers,
                              attributes: ['id', 'note']
                           }
                        ]
                     }
                  ]
               }
            ]
         })

         // if (!data || data.length === 0) {
         //   throw new customError('NotFound', `No answers found for survey ${id}`)
         // }

         // Calculate the average
         const notes = data.flatMap(survey =>
            survey.Questions.flatMap(question =>
               question.Questions_Answers.flatMap(qa =>
                  qa.Answer.note
               )
            )
         )

         const totalNotes = notes.reduce((sum, note) => sum + note, 0)
         const average = notes.length > 0 ? (totalNotes / notes.length).toFixed(3) : 0

         // Update the survey with the highest average
         if (average > maxAverage) {
            maxAverage = average
            maxSurvey = survey
         }

         // Update the survey with the lowest average
         if (average < minAverage) {
            minAverage = average
            minSurvey = survey
         }
      }

      return res.json({
         maxSurvey: {
            id: maxSurvey.id,
            company: maxSurvey.Company.name,
            name: maxSurvey.name,
            average: maxAverage
         },
         minSurvey: {
            id: minSurvey.id,
            company: minSurvey.Company.name,
            name: minSurvey.name,
            average: minAverage
         }
      })
   } 
   catch (err) {
      next(err)
   }
}