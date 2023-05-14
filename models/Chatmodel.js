const mongoose = require("mongoose")
const schema = new mongoose.Schema({
  message:{
    text:{
    type:String
  },
  file:{
    public_id:{
    type:String
  },
  url:{
    type:String
  }  }
  ,createAt:{type: Date}
},
  users:[],
  reciever:{
    type:String,
    required:true
  },
  sender:{
    type:String,
    required:true
  },
 
  
})
const model = new mongoose.model("chatmessage", schema)
module.exports = {model}