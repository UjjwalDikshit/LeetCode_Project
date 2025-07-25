
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require("../config/redis");

const userMiddleware = async(req,res,next)=>{

    try{
        const {token} = req.cookies;
        if(!token) throw new Error("Token is not present");

        const payload = jwt.verify(token,process.env.TOKEN_SECRET_KEY);

        const {_id} =  payload;

        if(!_id) {
            throw new Error("Invalid Token");
        }

        const result = await User.findById(_id);

        if(!result) await User.findById(_id);

        if(!result){
            throw new Error("User doesn't Exist");
        }

        // redis ke block list mein toh presnet nhi hai

        const IsBlocked = await redisClient.exists(`token:${token}`);
        
        if(IsBlocked)
            throw new Error("Invalid Token");

        req.result = result;

        next();
            

    }
    catch(err){
        res.status(401).sent("Error: "+err.message);
    }
}

module.exports = userMiddleware;