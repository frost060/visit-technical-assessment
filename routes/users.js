const express = require('express')
const router = express.Router()
const moment = require('moment')

const Users = require('../models/user')
const DB = require('../db')
const UserSteps = require('../models/user-steps')

const { sendStatusCodeWithMessage } = require('./utils')

router.get('/', async (req, res) => {
  try {
    const data = await Users.findAll()
    res.send(data)
  } catch (err) {
    console.log(err.message)
    sendStatusCodeWithMessage(500, `Server error: ${err.message}`, res)
  }
})

router.get('/:id', async (req, res) => {
  const { id: userId } = req.params
  try {
    const data = await Users.findByPk(userId)
    res.send(data)
  } catch (err) {
    sendStatusCodeWithMessage(500, `Server error: ${err.message}`, res)
  }
})

// get steps data per date wise
// assuming the user steps data is calculated  per day
router.get('/:id/steps', async (req, res) => {
  const { id: userId } = req.params
  try {
    const user = await Users.findByPk(userId)
    if (!user) {
      sendStatusCodeWithMessage(
        404,
        `User with given id: ${userId} not found`,
        res
      )
      return
    }

    const data = await UserSteps.findAll({
      where: {
        userId: user.id,
      },
      order: [['date', 'DESC']],
    })

    const result = {}
    data.forEach((entry) => {
      const { date, steps, calories } = entry
      const time = new Date(date)
      // yyyymmdd => moment(date).format('YYYYMMDD')
      result[moment(date).format('YYYYMMDD')] = { steps, calories }
    })

    res.send(result)
  } catch (err) {
    sendStatusCodeWithMessage(500, `Server error: ${err.message}`, res)
  }
})

// assuming the user steps data is calculated  per day
// steps date on this particular date for this particular user
router.get('/:id/steps/:ymd', async (req, res) => {
  const { id: userId, ymd } = req.params
  try {
    const user = await Users.findByPk(userId)
    if (!user) {
      sendStatusCodeWithMessage(
        404,
        `User with given id: ${userId} not found`,
        res
      )
      return
    }

    const data = await UserSteps.findAll({
      where: {
        userId: user.id,
        date: moment(ymd).format('YYYY-MM-DD H:mm:ss'),
      },
    })

    const result = {}
    data.forEach((entry) => {
      const { date, steps, calories } = entry
      const time = new Date(date)
      // yyyymmdd => moment(date).format('YYYYMMDD')
      result[moment(date).format('YYYYMMDD')] = { steps, calories }
    })

    res.send(result)
  } catch (err) {
    sendStatusCodeWithMessage(500, `Server error: ${err.message}`, res)
  }
})

module.exports = router
