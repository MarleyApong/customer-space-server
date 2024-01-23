const { QuestionsAnswers, Questions, Surveys, Companies, Answers } = require('../models')
const customError = require('../hooks/customError')

// CALCULATE THE AVERAGE OF ANSWERS TO A QUESTION
exports.averageQuestion = async (req, res, next) => {
  const id = req.params.id

  try {
    const data = await QuestionsAnswers.findAll({
      where: { idQuestion: id },
      include: [{ model: Answers }]
    })

    if (!data || data.length === 0) {
      throw new customError('NotFound', `no answers found for question ${id}`)
    }

    const totalNotes = data.reduce((sum, answer) => sum + answer.Answer.note, 0)
    const average = (totalNotes / data.length).toFixed(3)

    return res.json({ average })
  } catch (err) {
    next(err)
  }
}

// CALCULATE THE AVERAGE OF ANSWERS TO A SURVEY
exports.averageSurvey = async (req, res, next) => {
  const id = req.params.id

  try {
    const data = await QuestionsAnswers.findAll({
      include: [
        {
          model: Questions,
          include: [
            {
              model: Surveys,
              where: { id: id }
            }
          ]
        },
        { model: Answers }
      ]
    })

    if (!data || data.length === 0) {
      throw new customError('NotFound', `no answers found for survey ${id}`)
    }

    const totalNotes = data.reduce((sum, answer) => sum + answer.Answer.note, 0)
    const average = (totalNotes / data.length).toFixed(3)
    
    return res.json({ average })
  } catch (err) {
    next(err)
  }
}

// CALCULATE THE AVERAGE OF ANSWERS FOR A COMPANY
exports.averageCompany = async (req, res, next) => {
  const id = req.params.id

  try {
    const data = await QuestionsAnswers.findAll({
      include: [
        {
          model: Questions,
          include: [
            {
              model: Surveys,
              include: [
                {
                  model: Companies,
                  where: { id: id }
                }
              ]
            }
          ]
        },
        { model: Answers }
      ]
    })

    if (!data || data.length === 0) {
      throw new customError('NotFound', `no answers found for company ${id}`)
    }

    const totalNotes = data.reduce((sum, answer) => sum + answer.Answer.note, 0)
    const average = (totalNotes / data.length).toFixed(3)

    return res.json({ average })
  } catch (err) {
    next(err)
  }
}

// RETURNS THE COMPANY WITH THE HIGHEST AND LOWEST AVERAGE
exports.minMaxAverage = async (req, res, next) => {
  try {
    // Get all companies
    const companies = await Companies.findAll()

    if (!companies || companies.length === 0) {
      throw new customError('NotFound', 'No companies found')
    }

    // Initialize variables to store the company with the highest and lowest average
    let maxCompany = null
    let minCompany = null
    let maxAverage = -Infinity
    let minAverage = Infinity

    // Iterate through each company
    for (const company of companies) {
      const id = company.id

      // Get data associated with the company
      const data = await QuestionsAnswers.findAll({
        include: [
          {
            model: Questions,
            include: [
              {
                model: Surveys,
                include: [
                  {
                    model: Companies,
                    where: { id: id }
                  }
                ]
              }
            ]
          },
          { model: Answers }
        ]
      })

      if (!data || data.length === 0) {
        throw new customError('NotFound', `No answers found for company ${id}`)
      }

      // Calculate the average
      const totalNotes = data.reduce((sum, answer) => sum + answer.Answer.note, 0)
      const average = totalNotes / data.length

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
        average: maxAverage.toFixed(3)
      },
      minCompany: {
        id: minCompany.id,
        name: minCompany.name,
        average: minAverage.toFixed(3)
      }
    })
  } catch (err) {
    next(err)
  }
}