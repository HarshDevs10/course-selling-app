const { Router } = require('express')
const mongoose = require('mongoose')
const { courseModel,purchaseModel,adminModel } = require('../db')
const { userMiddleware } = require('../middleware/user')
const courseRouter = Router()

courseRouter.get('/preview', async (req, res) => {
    let courses = null
    try{
        courses = await courseModel.find({})
            .populate('creatorId')
    }catch(err){
        return res.json({
            mes: "an error occured",
            err: err
        })
    }

    if (courses.length === 0){
        return res.json({
            mes: "there are no courses available right now"
        })
    }

    res.json({
        courses: courses
    })
})

courseRouter.post('/purchase', userMiddleware, async (req, res) => {
    const userId = req.body.userid
    const courseId = req.body.courseId

    try{
        const purchase = await purchaseModel.create({
            userId: userId,
            courseId: courseId
        }).populate('userId')
          .populate('courseId')
        
    }
    catch(err){
        return res.json({
            mes: "an error occured while making purchase"
        })
    }

    res.json({
        mes: "your purcahse is successful"
    })
})

module.exports = {
    courseRouter: courseRouter
}