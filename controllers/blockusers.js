const {model}=require('../models/Blockmodel')

exports.userBlock=async(req,res)=>{
    try {
        const {sender,reciver}=req.body

        const data=await model.create({
            reciver_blocked:reciver,
            sender_blocker:sender,
        })
        res.status(200).send({
            status:true,
            data:data
        })
            } catch (error) {
        res.status(500).send({
            status:false,
            data:"server error "+ error.message
        })
    }
}


exports.userUnblock=async(req,res)=>{
    try {
        const {sender,reciver}=req.body
        const data=await model.findOne({$or:[
            {reciver_blocked:reciver,
                sender_blocker:sender}
        ]})
        console.log(data);
        if(data){
            const updateData=await model.deleteOne({_id:data._id})
            console.log(updateData);
            res.status(200).send({
                status:true,
                data:"user Unblock"
            })    
        }else{
            res.status(200).send({
                status:false,
                data:"user not exits"
            })    
        }
    } catch (error) {
        res.status(500).send({
            status:false,
            data:"server error "+ error.message
        })
    }
}


exports.getBlockuser=async(req,res)=>{
    try {
        const {sender,reciver}=req.body

        const data=await model.findOne({reciver_blocked:reciver,
                sender_blocker:sender})
            if(data){
                    res.status(200).send({
                        status:true,
                        data:data
                    })
            }else{
                const data=await model.findOne({reciver_blocked:sender,
                    sender_blocker:reciver})
                    if(data){
                        res.status(200).send({
                            status:true,
                            data:data
                        })  
                    }else{
                        res.status(200).send({
                            status:false,
                            data:"No data Found"
                        })
                    }


            }
    } catch (error) {
        res.status(500).send({
            status:false,
            data:"server error "+ error.message
        })
    }
}