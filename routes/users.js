const { Router } = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
require('dotenv').config()
const { userModel,purchaseModel,courseModel } = require('../db')
const { userMiddleware } = require('../middleware/user')
const userRouter = Router()


userRouter.post('/signup', async (req, res) => {

    const signupSchema = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(8).max(50).refine(
            (value) => /[A-Z]/.test(value),
            {message: "the password should contain atleast one uppercase character"}
        ).refine(
            (value) => /[a-z]/.test(value),
            {message: "the password should constain ateast one lowercase character"}
        ).refine(
            (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
            {message: "the password should constain atleast one special character"}
        ),
        firstName: z.string().min(1).max(50),
        lastName: z.string().min(1).max(50)
    })

    const parsedReq = signupSchema.safeParse(req.body)

    if (!parsedReq.success){
        return res.json({
            mes: "an error occured while validation of the input",
            err: parsedReq.error.issues[0].message
        })
    }

    const email = req.body.email
    const password = req.body.password
    const firstName = req.body.firstName
    const lastName = req.body.lastName

    const hashed = await bcrypt.hash(password, 5)
    try{
    const user = await userModel.create({
        email: email,
        password: hashed,
        firstName: firstName,
        lastName: lastName
    })
    console.log(user)
    }
    catch(err){
        return res.json({
            mes: "an error occured while signing up",
            err: err.errmsg
        })

    }

    res.json({
        mes: "you have signed up successfully"
    })
})

userRouter.post('/signin', async (req, res) => {

    const signinSchema = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(50)
    })

    const parsedReq = signinSchema.safeParse(req.body)

    if(!parsedReq.success){
        return res.json({
            mes: "an error occured while validating the input",
            err: parsedReq.error.issues[0].message
        })
    }

    const email = req.body.email
    const password = req.body.password
    let user = null
    try{
        user = await userModel.findOne({
            email: email
        })
        if (!user){
            return res.json({
                mes: "this accout has not signed in"
            })
        }
    }
    catch(err){
        return res.json({
            mes: "could not find user",
        })
    }

    const hashed = await bcrypt.compare(password, user.password)
    
    if (hashed){
    let token = null
    try{
        token = jwt.sign({
            Id: user._id.toString()
        }, process.env.user_secret)

    }
    catch(err) {
        return res.json({
            mes: "an error occured while creating token",
            err: err
        })
    }
    
    res.json({
        mes: "you have signed in successfully",
        token: token
    })
    }
    else{
        return res.json({
            mes: "incorrect password"
        })
    }


}
)


userRouter.get('/purchases', userMiddleware, async (req, res) => {
    const userId = req.Id

    let purchase = null
    let courses = null
    try{
        purchase = await purchaseModel.find({
            userId: userId
        }).populate('userId')
          .populate('courseId')

        if (purchase.length === 0){
            return res.json({
                mes: "you have not purchased any course yet"
            })
        }
        console.log(purchase)

        courses = await courseModel.findById(purchase.courseId)
                        .populate('creatorId')
        
        if (!courses){
            return res.json({
                mes: "an error occured while finding the courses"
            })
        }
        console.log(courses)
    }
    catch(err){
        return res.json({
            mes: "an error occured"
        })
    }

    res.json({
        mes: "your courses are:" ,
        courses: courses
    })
})

module.exports = {
    userRouter: userRouter
}
