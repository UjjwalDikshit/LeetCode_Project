

const express = require('express')
const {register,login,logout,adminRegister} = require('../controllers/userAuthent');
const authRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require('../middleware/adminMiddleware');



// Register
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);


// authRouter.get('/getProfile',getProfile);


// login
// logout
// GetProfile

module.exports = authRouter;