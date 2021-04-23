const mongoose = require("mongoose")

const config = new mongoose.Schema({
  currentnumber: String,
  lastuser: String,
  guild: String
})

 const MessageModel = module.exports = mongoose.model("counting",config)