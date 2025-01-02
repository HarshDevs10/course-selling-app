const jwt = require('jsonwebtoken')
require('dotenv').config()
const user_secret = process.env.user_secret

function userMiddleware(req, res, next){
    const token = req.cookies.uid

    if (!token){
        res.json({
            mes: "please signin first"
        })
    }
    else{
        const decoded = jwt.verify(token, user_secret)

        if (decoded.Id){
            req.Id = decoded.Id
            next()
        }
        else{
            res.json({
                mes: "you are not signed in"
            })
        }
    }
}

module.exports = {
    userMiddleware: userMiddleware
}