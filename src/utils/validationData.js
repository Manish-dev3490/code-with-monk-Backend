const validator = require('validator');

function validateSignUpApi(reqBody) {
    const mandatoryFields = ["firstName", "emailId", "password"];

    const isAllowed = mandatoryFields.every(
        (field) => reqBody[field]
    );

    if (!isAllowed) {
        throw new Error("Some fields are missing");
    }

    const { firstName, emailId, password } = reqBody;

    if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email id");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password");
    }

    if (firstName.length < 3 || firstName.length > 25) {
        throw new Error(
            "First name length should be between 3 and 25"
        );
    }
}


function validateLoginApi(req) {

    const { email, password } = req.body;
    if (!email) throw new Error("please enter the email");

    if (!password) throw new Error("please enter the  password");


    if (!validator.isEmail(email)) {
        throw new Error("please enter the valid email");
    }


}

module.exports={
    validateSignUpApi,
    validateLoginApi
}