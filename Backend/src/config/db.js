// es folder ko config kahte hai

const mongoose = require("mongoose")

async function connectDB(){
    try{

        await mongoose.connect("mongodb://avinash954638_db_user:trackerDB2@ac-gcimv6q-shard-00-00.zbzvyc4.mongodb.net:27017,ac-gcimv6q-shard-00-01.zbzvyc4.mongodb.net:27017,ac-gcimv6q-shard-00-02.zbzvyc4.mongodb.net:27017/?ssl=true&replicaSet=atlas-kqpzys-shard-0&authSource=admin&appName=TrackerDatabase")

        console.log("database is connected")
    }catch(error){
        console.log("database connection failed", error)
    }
}

module.exports = connectDB;