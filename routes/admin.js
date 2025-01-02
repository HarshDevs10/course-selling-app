const { Router } = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
require('dotenv').config()
const { adminModel, courseModel } = require('../db')
const { adminMiddleware } = require('../middleware/admin')
const user = require('../middleware/user')
const { parse } = require('dotenv')
const admin = require('../middleware/admin')
const adminRouter = Router()

adminRouter.post('/signup', async (req, res) => {

    const signupSchema = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(8).max(50).refine(
            (value) => /[A-Z]/.test(value),
            {message: "the password should contain atleast one uppercase cahracter"}
        ).refine(
            (value) => /[a-z]/.test(value),
            {message: "the password should contain atleast one lowercase character"}
        ).refine(
            (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
            {message: "the password should contain atleast one special character"}
        ),
        firstName: z.string().min(1).max(50),
        lastName: z.string().min(1).max(50)
    })

    const parsedReq = signupSchema.safeParse(req.body)

    if(!parsedReq.success){
        return res.json({
            mes: "an error occured while validating input",
            err: parsedReq.error.issues[0].message
        })
    }

    const email = req.body.email
    const password = req.body.password
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const hashed = await bcrypt.hash(password, 5)

    try{
        const user = await adminModel.create({
            email: email,
            password: hashed,
            firstName: firstName,
            lastName: lastName
        })
        console.log(user)
    }
    catch(err){
        return res.json({
            mes: "error occured while signing up"
        })
    }

    res.json({
        mes: "you have successfully signed up"
    })

})

adminRouter.post('/signin', async (req, res) => {

    const signinSchema = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(8).max(50)
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
    let admin = null
    try{
        admin = await adminModel.findOne({
            email: email
        })
        console.log(admin)
        if (admin === null){
            return res.json({
                mes: "you have not signed up"
            })
        }
    }
    catch(err){
        return res.json({
            mes: "could not find this user"
        })
    }

    try{
    const hashedPassword = await bcrypt.compare(password, admin.password)

    if(hashedPassword){
        let token = null
        try{
        token = jwt.sign({
            id: admin._id.toString()
        }, process.env.admin_secret)
    }
    catch(err){
        return res.json({
            mes: "token cannot be created"
        })
    }

    res.cookie("aid", token)
    res.send('you have successfully signed in')

    }
    else{
        return res.json({
            mes: "incorrect passowrd"
        })
    }
}
catch(err){
    res.json({
        mes: "an error occured in comparing the passwords",
        err: err
    })
}

})

adminRouter.post('/course', adminMiddleware, async (req, res) => {

    const courseSchema = z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(5).max(500),
        price: z.number(),
        ImageUrl: z.string().min(3).max(50)
    })

    const parsedReq = courseSchema.safeParse(req.body)

    if(!parsedReq.success){
        return res.json({
            mes: "an error occured while validating the input",
            err: parsedReq.error.issues[0].message
        })
    }

    const adminId = req.adminid
    const obadminId = new mongoose.Types.ObjectId(adminId)
    console.log(obadminId)
    console.log(req.body)
    const { title,description,price,ImageUrl } = req.body
    let course = null
    try{
        course = await courseModel.create({
            title: title,
            description: description,
            price: price,
            ImageUrl: ImageUrl,
            creatorId: obadminId
        })
    }
    catch(err){
        return res.json({
            mes: "an error occured while creating the record",
            err: err
        })
    }

    res.json({
        mes: "you have successfully created your course",
        course: course._id
    })
})

adminRouter.put('/course', adminMiddleware, async (req, res) => {

    const courseSchema = z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(5).max(500),
        price: z.number,
        ImageUrl: z.string().min(3).max(50)
    })

    const parsedReq = courseSchema.safeParse(req.body)

    if(!parsedReq.success){
        return res.json({
            mes: "an error occured while validating the input",
            err: parsedReq.error.issues[0].message
        })
    }

    const adminId = req.adminid
    const { title, description, price, ImageUrl, courseId } = req.body

    try{
        const updatedRecord = await courseModel.findOneAndUpdate({
            _id: courseId,
            creatorId: adminId
        },{
            title,
            description,
            price,
            ImageUrl,
            creatorId: adminId
        },{
            new: true
        })

        if(!updatedRecord){
            return res.json({
                mes: "this course do not exists and can not be updated",
                doc: updatedRecord
            })
        }

        console.log(updatedRecord)

    }
    catch(err){
        return res.json({
            mes: "an error occured while finding and updating the document",
            err: err
        })
    }

    res.json({
        mes: "the record is updated"
    })
})

adminRouter.get('/course/bulk', adminMiddleware, async(req, res) => {
    const adminId = req.adminid
    console.log(adminId)

    let courses = null
    try{
        courses = await courseModel.find({
            creatorId: adminId
        }).populate('creatorId')

        console.log(courses)
        if (!courses){
            return res.json({
                mes: "you have not created an course till now"
            })
        }
    }
    catch(err){
        return res.json({
            mes: "an error occured while finding your courses"
        })
    }

    res.json({
        courses: courses
    })
})

adminRouter.delete('/logout', (req, res) => {
    try{
        res.clearCookie('aid')
    }
    catch(err){
        res.send('an error occured while loging out ' + err)
    }

    res.send('you have successfully loged out')
})

module.exports = {
    adminRouter: adminRouter
}