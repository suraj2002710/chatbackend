const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    sender_blocker:{
        type:String,
        required:true
    },
    reciver_blocked:{
        type:String,
        required:true
    },
})

const model=new mongoose.model("blockusers",schema)
module.exports={model}