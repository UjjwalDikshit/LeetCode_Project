const User = require("../models/user");
const validate = require('../utils/validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');



// const register = async (req,res)=>{
    
//     try{
//         // validate the data;
//       validate(req.body); 
//       const {firstName, emailId, password}  = req.body;

//       req.body.password = await bcrypt.hash(password, 10);
//       req.body.role = 'user'
//     //
    
//      const user =  await User.create(req.body);
//      const token =  jwt.sign({_id:user._id , emailId:emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
//      res.cookie('token',token,{maxAge: 60*60*1000});
//      res.status(201).send("User Registered Successfully");
//     }
//     catch(err){
//         res.status(400).send("Error: "+err);
//     }
// }


// const register = async (req, res) => {

//     try {

//         validate(req.body);
//         const { firstName, emailId, password } = req.body;

//         if (!firstName || !emailId || !password) {
//             return res.status(400).send("Missing required fields");
//         }

//         // console.log(emailId);
//         // req.body.password = await bcrypt.hash(password,10);
//         // req.body.role = 'user';
//         //


//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Prepare user data
//         const userData = {
//             firstName,
//             emailId,
//             password: hashedPassword,
//             role: 'user'
//         };

//         console.log("User Data:", userData);
//         console.log("Email:", userData.emailId);

//         // const user = await User.create(req.body);
//         const user = await User.create(userData);

//         // const token = jwt.sign({__id:user._id, emailId : emailId, role:'user'},process.env.TOKEN_SECRET_KEY,{expiresIn:60*60});

//         const token = jwt.sign(
//             { _id: user._id, emailId: user.emailId, role: 'user' },
//             process.env.TOKEN_SECRET_KEY,
//             { expiresIn: '1h' } // readable format
//         );



//         res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
//         res.status(201).send("User Registered Successfully");
//     }
//     catch (err) {
//         console.log(req.body.emailId);
//         res.status(400).send("Error: " + err);
//     }
// }



// AI written code
const register = async (req, res) => {
  try {
    // Step 1: Validate body
    console.log("Incoming body:", req.body);
    validate(req.body); // if this throws, you'll go to catch

    const { firstName, emailId, password } = req.body;

    // Step 2: Check required fields manually
    if (!firstName || !emailId || !password) {
      return res.status(400).send("Missing required fields");
    }

    // Step 3: Prepare user data
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      firstName,
      emailId,
      password: hashedPassword,
      role: 'user'
    };

    console.log("Creating user with:", userData);

    // Step 4: Save user
    const user = await User.create(userData);

    // Step 5: Generate token
    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role:'user' },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '1h' }
    );

    // Step 6: Set token cookie
    res.cookie('token', token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(201).send("User Registered Successfully");
  } catch (err) {
    console.error("💥 Error in registration:", err);
    res.status(400).send("Error: " + (err.message || err));
  }
};



const login = async (req, res) => {
    try {

        const { emailId, password } = req.body;

        if (!emailId)
            throw new Error("Invalid Credentials");
        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });
        console.log(user);
        const match = bcrypt.compare(password, user.password);

        if (!match)
            throw new Error("Invalid Credentials");

        const token = jwt.sign({ _id: user._id, emailId: emailId,role:user.role }, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000 });
        res.status(200).send("Logged In successfully");

    } catch (err) {
        res.status(401).send("Error: " + err);
    }
}



// logOut feature

const logout = async (req, res) => {

    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, { expireAt: new Date(Date.now()) });
        res.status(200).send("Logged Out Succesfully");
    }
    catch (err) {
        res.status(503).send("Error" + err);
    }
}


const adminRegister = async (req, res) => {

    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = "admin";
        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 });
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(201).send("User Registered Successfully");
    }
    catch (err) {
        res.status(400).send("Error: 0" + err);
    }
}

module.exports = { register, login, logout, adminRegister };