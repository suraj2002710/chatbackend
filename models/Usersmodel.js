const mongoose=require("mongoose")
const schema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min:3,
        maxlength:25
    },
    email:{
        type:String,
        unique:true,
      
        required:true
    },
    password:{
        type:String,
        minlength:5,
        required:true
    },
    notificationtoken:{
        type:String,
    },
    profile:{
        publicid:{
            type:String,
        },
        url:{
            type:String,
        }
    },
    online:{
        type:Boolean,
    }
})
const model=new mongoose.model("users",schema)
module.exports=model