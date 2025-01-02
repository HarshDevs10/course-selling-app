const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const { userRouter } = require('./routes/users')
const { courseRouter } = require('./routes/courses')
const { adminRouter } = require('./routes/admin')


app.use(express.json())
app.use(cookieParser())
app.use('/api/v1/user', userRouter)
app.use('/api/v1/course', courseRouter)
app.use('/api/v1/admin', adminRouter)

async function main(){
await mongoose.connect(process.env.MongoDB_Url)
        .then(app.listen(3000))
        .catch(err => console.log('data base is not connected due to: ', err))
        console.log('listening on port 3000')
}

main()