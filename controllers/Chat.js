const {model}=require("../models/Chatmodel")
const { login } = require("./Users")
const {model:requestModel}=require('../models/requestVerifications')
const {model:blockusermodel}=require("../models/Blockmodel")
const cloudinary=require("cloudinary").v2
const fs=require("fs")
const redis=require("redis")
const client= redis.createClient('redis//:127.0.0.1:6379')

exports.redisapi=async(req,res)=>{
    try {
        const {key,value}=req.body
        const data=await client.set(key,value)        
        res.send(data)
    } catch (error) {
        console.log(error);
    }
}

exports.chatmessage=async(req,res)=>{
    try{
        const {reciever,sender,message}=req.body 
        // console.log("suraj");
        let file
        const accpectCheck=await requestModel.findOne({
            sennderId:sender,
            reciverId:reciever
    })
   
        if(accpectCheck){
            console.log(accpectCheck);
            let accpect=accpectCheck.accpect
            if(accpect=='Pending'){
                res.status(200).send({
                    status:true,
                    data:"your request not Accpected"
                })
                return false
            }
        }

        const checkBlockuser=await blockusermodel.findOne({
            sender_blocker:sender,
            reciver_blocked:reciever})
    if(checkBlockuser){
        console.log(checkBlockuser);

            console.log("blocke1",checkBlockuser);
            res.status(200).send({
                status:true,
                data:"this user is blocked"
            })

        return false
    }

    else{
        const checkBlockusers=await blockusermodel.findOne({$or:[
            {sender_blocker:reciever},
            {reciver_blocked:sender}    ]})

            if(checkBlockusers){
                console.log(checkBlockusers);
        
                    res.status(200).send({
                        status:true,
                        data:"You are blocked"
                    })
                return false
            }
    }
        

        if(req.file){
             file= req.file
            console.log(file);
            const img= await cloudinary.uploader.upload(file.path,{transformation: [
                {width: 1000, crop: "scale"},
                {quality: "auto"},
                {fetch_format: "auto"}
                ],folder:"chatAppfiles"
            }
                )
            console.log(img);
            const data=await model.create({
                message:{text:message, file:{public_id:img?.public_id,url:img?.secure_url
                }},
                users:[reciever,sender],
                sender:sender,
                reciever:reciever,
            })
            console.log(data);
                fs.unlink(file.path,(err)=>{
                    if(err) throw err
                    // console.log("deleteed");
                })
            }
            else{
                console.log("suraj123");
                const data=await model.create({
                    message:{
                        text:message, file:{public_id:"",url:""
                    },createAt:new Date().getTime()},
                    users:[reciever,sender],
                    sender:sender,
                    reciever:reciever,
                    
                })
                // console.log(data);
                console.log(data);
            }
           
            res.status(200).send({
                status: true,
                msg:"message succesfully send",
                
            })
    } catch (error) {
        // console.log(error);
    }
}
exports.getchatmessage=async(req,res)=>{
    try {
        const {reciever,sender}=req.body
        const data=await model.find({users:{"$all":[reciever,sender]}}).sort({updatedAt:1})
        // console.log(data);
        const msg=data.map((it)=>{
            return({
                me:it.users[0]==reciever,
                msg:it.message
            })
        })
        // for(i=0;i<data.length;i++){
        //     console.log(data[i].message.createAt)
        //     for(j=i;j<data.length;j++){
        //         if(data[i].message.createAt==data[j].message.createAt){
        //             console.log(data[j].message.createAt);
        //         }

        //     }
        // }

        

        // console.log(msg)
        res.send({
            status:true,
            data:msg
        })
    } catch (error) {
        // console.log(error);
        res.send({
            status:false,
            message:"server error"
        })
    }
}

exports.msgdelete=async(req,res)=>{
    try {
        const {msgid,msg}=req.body
        const data=await model.findOne({_id:msgid}).sort({updatedAt:1})
        if(data){
            if(msg=="file"){
                if(data.message.file.url==''){
                    const deletedata=await model.deleteOne({_id:msgid})
                }
            }
        }
        if(msgid){

        }
    } catch (error) {
        res.send({
            status:false,
            message:"server error"
        })
    }
}