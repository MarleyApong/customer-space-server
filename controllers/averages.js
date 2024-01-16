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
    const average = totalNotes / data.length

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
    const average = totalNotes / data.length

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
    const average = totalNotes / data.length

    return res.json({ average })
  } catch (err) {
    next(err)
  }
}