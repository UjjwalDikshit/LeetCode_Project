
const validator = require("validator");

// req.body

const validate = (data)=>{
    const mandatoryField= ['firstName','emailId','password'];

    const isAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k));

    if(!isAllowed)
        throw new Error("Some filed Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("invalid Email");

    if(!validator.isStrongPassword(data.isStrongPassword))
        throw new Error("Week Password");
}

module.exports = validate;