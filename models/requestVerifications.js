const mongoose=require('mongoose');

const schema=new mongoose.Schema({
    sennderId:{
        type:String,
    },
    reciverId:{
        type:String,
    },
    // users:Array,
    accpect:{
        type:String,
    },
    block:{
        type:Boolean,
        default:false
    }
});

const model=new mongoose.model("chatRequest", schema)
module.exports = {model}