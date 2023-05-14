const jwt=require("jsonwebtoken")
const  model  = require("../models/Usersmodel")
exports.authenticate=async(req,res,next)=>{
        try {
            let token=req.query.token
            if(!token){
                res.status(200).send({
                    success:false,
                    msg:"please login"
                })
            }
            else{
                await jwt.verify(token,"surajsruajsruajsurajsurajsraujsdhfkshgafhdfsjsdhfdskfghdsgfjhjk",async(err,decode)=>{
                    if(err){
                        res.send({
                            status:false,
                            msg:"token is expired"
                        })
                    }
                    else{
                        // console.log(decode);
                        const data=await model.find({_id:decode.id}).select('-profile')
                        req.user=data[0]
                        // console.log(req.user);
                        next()
                    }
                })  
            }
        } catch (error) {
            console.log(error);
        }
}
