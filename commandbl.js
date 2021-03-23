const mongoose = require("mongoose")

const config = new mongoose.Schema({
  memberID: String 
})

 const MessageModel = module.exports = mongoose.model("commandblacklist",config)