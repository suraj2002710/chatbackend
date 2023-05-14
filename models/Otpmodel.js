const moongose=require('mongoose')
const obj={
    email:{type:String,
        required:true
    },
    otpnumber:{type:String,
        required:true
    },
    created_at:Date,
    expired_at:Date,
}
const schema=new moongose.Schema(obj)
const model=new moongose.model("otpnumber",schema)
module.exports=model