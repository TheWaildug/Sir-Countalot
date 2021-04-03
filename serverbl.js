const mongoose = require("mongoose")

const config = new mongoose.Schema({
  guildID: String,
  reason: String,
  blacklisted: Boolean  
})

 const MessageModel = module.exports = mongoose.model("serverblacklist",config)