const  model = require("../models/Otpmodel");
const usermodel=require('../models/Usersmodel')
const bcrypt=require('bcryptjs');
const { transporter } = require("./Mailtransport");


const sendmail=async(email,otp)=>{
    let info = await transporter.sendMail({
        from: 'surajaheer448@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Email verification", // Subject line
        text: "your Otp", // plain text body
        html: `<b>${otp}</b>`, // html body
      });
    
      console.log("Message sent: %s", info.messageId);
}

exports.otpsend=async(req,res)=>{
    try {
        const {email}=req.body
        let otp
        const users=await usermodel.find({email:email})
                console.log(email);
        if(!users.length){

            const otpemail=await model.deleteOne({email:email})
                otp = Math.floor(1000 + Math.random() * 9000);
           console.log(otp);
            const hashotp=await bcrypt.hash(otp.toString(),10)
            const dataotp=await model.create({
                email:email,
                otpnumber:hashotp,
                created_at: new Date().getTime(),
                expired_at:new Date().getTime()+2*60000
            })
            sendmail(email,otp)
            res.status(200).send({
                data:dataotp,
                status:true
            })
        }
        else{
            res.status(200).send({
                data:"your email already exist Please login",
                status:false
            })   
        }
    } catch (error) {
        console.log(error);
    }
}

exports.otpverify=async(req,res)=>{
    try {
        const {otp,email}=req.body
        const data=await model.findOne({email:email})
        console.log(data);
        if(data){
            const compareotp=await bcrypt.compare(otp.toString(),data.otpnumber)
            if(compareotp){
                if(data.expired_at>new Date().getTime()){
                    const datadelete=await model.deleteOne({_id:data._id})
                        res.status(200).send({
                            status:true,
                            data:"Opt verify"
                        })
                }else{
                    res.status(200).send({
                        status:false,
                        data:"Your Otp is Expired please send another otp"
                    })
                }
            }
            else{
                res.status(200).send({
                    status:false,
                    data:"please Enter valid Otp"
                })
        }
    }else{
        res.status(200).send({
            status:false,
            data:"otp and email are not valid"
        })
    }
    } catch (error) {
        console.log(error);
        res.status(501).send({
            status:false,
            data:"server error"
        })
    }
}