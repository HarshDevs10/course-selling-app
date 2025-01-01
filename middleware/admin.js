const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET = process.env.admin_secret

function adminMiddleware(req, res, next){
    const token = req.headers.token
    
    if(!token){
        res.json({
            mes: "please signin first"
        })
    }
    else{
        const decoded = jwt.verify(token, JWT_SECRET)
        
        if(decoded.id){
            req.adminid = decoded.id
            next()
        }
        else{
            res.json({
                mes: "your are not signed in"
            })
        }
        
    }

}

module.exports = {
    adminMiddleware: adminMiddleware
}