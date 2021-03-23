const mongoose = require("mongoose")

const config = new mongoose.Schema({
  guildID: String,
  color: String,  
})

 const MessageModel = module.exports = mongoose.model("embedcolor",config)