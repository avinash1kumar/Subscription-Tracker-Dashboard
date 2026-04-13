const app = require("./src/app")
const connectDB = require("./src/config/db")


connectDB();


app.listen("2000", ()=> {
    console.log("server is running")
})