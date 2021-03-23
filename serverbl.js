const mongoose = require("mongoose")

const config = new mongoose.Schema({
  guildID: String 
})

 const MessageModel = module.exports = mongoose.model("serverblacklist",config)