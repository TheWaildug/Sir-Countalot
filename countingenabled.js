const mongoose = require("mongoose")

const config = new mongoose.Schema({
  guildID: String,
  enabled: Boolean,  
})

 const MessageModel = module.exports = mongoose.model("coutningenable",config)