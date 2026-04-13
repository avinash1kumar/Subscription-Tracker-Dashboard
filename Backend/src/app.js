const express = require("express");


const app = express();
app.use(express.json())


app.post("/userData", (req,res) =>{
    console.log(req.body)
    res.status(201).json({
        message: "success",
        data: req.body
    })
})


module.exports = app;