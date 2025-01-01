const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectID = mongoose.Types.ObjectId

const userSchema = new Schema({
    email: {type: String, unique: true},
    password: String,
    firstName: String,
    lastName: String
})

const adminSchema = new Schema({
    email: {type: String, unique: true},
    password: String,
    firstName: String,
    lastName: String
})

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    ImageUrl: String,
    creatorId: {type: ObjectID, ref: 'admin'}
})

const purchaseSchema = new Schema({
    userId: {type: ObjectID, ref: 'user'},
    courseId: {type: ObjectID, ref: 'course'}
})

const userModel = mongoose.model('user', userSchema)
const adminModel = mongoose.model('admin', adminSchema)
const courseModel = mongoose.model('course', courseSchema)
const purchaseModel = mongoose.model('purchase', purchaseSchema)

module.exports = {
    userModel: userModel,
    adminModel: adminModel,
    courseModel: courseModel,
    purchaseModel: purchaseModel
}