const mongoose = require("mongoose")

const config = new mongoose.Schema({
  memberID: String,
  rank: String,  
})

 const MessageModel = module.exports = mongoose.model("devlist",config)