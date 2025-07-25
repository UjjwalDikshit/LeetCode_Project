const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db')
const cookieParser = require('cookie-parser')
const authRouter = require("./routes/userAuth");
const redisClient = require("./config/redis");



app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);


const Initialization = async ()=>{

    try{
        await Promise.all([main(),redisClient.connect()]);
        console.log("Database Connected");

        app.listen(process.env.PORT,()=>{
            console.log("Server is listening at port Number : " + process.env.PORT);
        })
    }
    catch(err){
        console.log("Error "+err);
    }
}

Initialization();




// main().
// then(async()=>{
//     app.listen(process.env.PORT,()=>{
//     console.log("Server is listening at port number: "+ process.env.PORT);
//     })                                                                // https://chatgpt.com/share/68809b1e-240c-8007-a7f6-341120b4dad7
// }).catch(err => console.log("Error Occured: " + err));

// this upper code is bulky and not redable so again writing this code down
