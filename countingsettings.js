const mongoose = require("mongoose")

const config = new mongoose.Schema({
  guildID: String,
  channel: String,
  dupes: Boolean,
  webhook: Boolean,
  reset: Boolean, 
  
})

 const MessageModel = module.exports = mongoose.model("countingsettings",config) 