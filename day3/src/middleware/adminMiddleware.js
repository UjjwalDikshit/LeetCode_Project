const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req,res,next)=>{


    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error("Token is not present");
        }

        const payload = jwt.verify(token,process.env.TOKEN_SECRET_KEY);

        const {_id} = payload;

        if(!_id){ throw new Error("Invalid token");}

        const result = await User.findById(_id);

        console.log(_id);

        if(payload.role != 'admin')
            throw new Error("Invalid Token");

        if(!result){
            throw new Error("User Doesn't Exists");
        }

        // redis ke blocklist me presntt toh nhi

        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("Invalid Token");

        req.result = result;


        next();
    }
    catch(err){
        res.status(401).send("Error: 1"+ err.message);
    }

}
module.exports = adminMiddleware;