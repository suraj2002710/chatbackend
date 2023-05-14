const {model}=require('../models/requestVerifications')

exports.requestSend=async(req,res)=>{
    try {
        const {sender,reciver}=req.body        
        const data=await model.create({
            sennderId:sender,
            reciverId:reciver,
            accpect:"Pending",
            // users:[reciver,sender]
        })
        res.status(200).send({
            status:true,
            data:data
        })
    } catch (error) {
        res.status(500).send({
            status:false,
            message:"server error " + error.message
        })
    }
}

exports.requestAccpect=async(req,res)=>{
    try {
        const {sender,reciver}=req.body

        const data=await model.findOne({$and:[
            {sennderId:sender},
            {reciverId:reciver}
        ]})

        if(!data){
        console.log("accpect",data);
        
            const datas=await model.findOne({$and:[
                {sennderId:reciver},
                {reciverId:sender}
            ]})    
            console.log("datas",datas);
            if(datas){
                id=datas._id
            const updatedata=await model.updateOne({_id:id},{accpect:"Accpect"})
            console.log(updatedata);
            res.status(200).send({
                status:true,
                data:"request accepted"
            })
            }
        }
        else{
        console.log("accpect",data);

            let id=data._id
            const updatedata=await model.updateOne({_id:id},{accpect:"Accpect"})
            console.log(updatedata);
            res.status(200).send({
                status:true,
                data:"request accepted"
            })
        }
       
        
    } catch (error) {
        res.status(500).send({
            status:false,
            data:"server error "+ error.message
        })
    }
}




exports.checkAccpection=async(req,res)=>{
    try {
        const {sender,reciver}=req.body
        const data=await model.findOne({$or:[
            {sennderId:sender,reciverId:reciver},
         
        ]})

        console.log("suraj",data);
        if(!data){
            const data=await model.findOne({$or:[
                {sennderId:reciver,reciverId:sender},
            ]})
            if(data){
                
                    res.status(200).send({
                        status:true,
                        data:data
                    })   
            }else{

                res.status(200).send({
                    status:true,
                    data:"new connection"
                })  
            }
        }
        else{
           
                res.status(200).send({
                    status:true,
                    data:data
                })   
         
        }
        
    } catch (error) {
        res.status(200).send({
            status:false,
            data:"server error "+ error.message
        })
    }
}