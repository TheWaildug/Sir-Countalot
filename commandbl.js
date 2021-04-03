const mongoose = require("mongoose")

const config = new mongoose.Schema({
  memberID: String,
  reason: String,
  blacklisted: Boolean 
})

 const MessageModel = module.exports = mongoose.model("commandblacklist",config)