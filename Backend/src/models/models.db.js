const mongoose = require("mongoose")

// schema create karenge
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,  
        unique: true
    },
    password: {
        type: String,
        require: true
    }
})

const userModule = mongoose.model("user", userSchema)

module.exports = userModule;