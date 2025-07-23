
const express = require('express')
const app = express();
require('dotenv').config();
const main = require('./config/db')
const cookieParser = require('cookie-parser')


app.use(express.json());
app.use(cookieParser());


main().
then(async()=>{
    app.listen(process.env.PORT,()=>{
    console.log("Server is listening at port number: "+ process.env.PORT);
    })                                                                // https://chatgpt.com/share/68809b1e-240c-8007-a7f6-341120b4dad7
}).catch(err => console.log("Error Occured: " + err));
