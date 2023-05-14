const model = require("../models/Usersmodel");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { model: chatmodle } = require("../models/requestVerifications");
const cloudinary = require("cloudinary").v2
const fs=require("fs")
exports.usersinup = async (req, res) => {
    try {
        const { name, email, password,notificationtoken } = req.body
        let img = req.file
        
        
        const data = await model.find({ email: email })
        if (data.length) {
            res.status(200).send({
                msg: "this email already in use",
                status: false
            })
        }
        else {
            const hashpssword = await bcrypt.hash(password, 10)
            if (!req.file) {
                const data = model({
                    name: name,
                    email: email,
                    password: hashpssword,
                    notificationtoken:notificationtoken,
                    profile: {
                        publicid:"",
                        url:""
                    },
                    online:false
                })
                data.save()
                
            const token = await jwt.sign({ id: data._id }, "surajsruajsruajsurajsurajsraujsdhfkshgafhdfsjsdhfdskfghdsgfjhjk", { expiresIn: "1d" })
            res.status(200).send({
                status: true,
                msg: "sinup successfully",
                token: token
            })
            }
            else {
                let image = await cloudinary.uploader.upload(req.file.path, {
                    transformation: [
                        { width: 1000, crop: "scale" },
                        { quality: "auto" },
                        { fetch_format: "auto" }
                    ], folder: "chatAppprofileImages"
                }
                )
                const data = model({
                    name: name,
                    email: email,
                    password: hashpssword,
                    notificationtoken:notificationtoken,
                    profile: {
                        publicid:image?.public_id,
                        url:image?.secure_url
                    }
                })
                data.save()
                fs.unlink(req.file.path,(err)=>{
                    if(err) throw err
                    // 
                })
                
            const token = await jwt.sign({ id: data._id }, "surajsruajsruajsurajsurajsraujsdhfkshgafhdfsjsdhfdskfghdsgfjhjk", { expiresIn: "1d" })
            res.status(200).send({
                status: true,
                msg: "sinup successfully",
                token: token
            })
            }
            
        }
    } catch (error) {
        
        res.status(500).send({ message: 'Server error' });
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const data = await model.findOne({ email: email }).select('-profile')
        
        if (data) {
            const compasswrd = await bcrypt.compare(password, data.password)
            
            if (compasswrd) {
                const token = await jwt.sign({ id: data._id }, "surajsruajsruajsurajsurajsraujsdhfkshgafhdfsjsdhfdskfghdsgfjhjk", { expiresIn: "1d" })
                res.status(200).send({
                    status: true,
                    msg: "you are login",
                    token: token
                })
            }
            else {
                res.status(200).send({
                    status: false,
                    msg: "password do not match"
                })
            }

        }
        else {
            res.status(200).send({
                status: false,
                msg: "email does not exit"
            })

        }
    } catch (error) {
        
        res.status(500).send({ message: 'Server error' });

    }
}

exports.singleuserget = async (req, res) => {
    try {
        const data = await model.find({ _id: req.user._id })
        res.status(200).send({
            status: true,
            data: data
        })

    } catch (error) {
        res.status(500).send({
            status: false,
            data: "server error"
        })
    }
}

exports.getallfriendsusers = async (req, res) => {
    try {
        const { sender } = req.body
        const data = await chatmodle.find({
            $or: [{ sennderId: sender },
            { reciverId: sender }
            ]
        })
        //   
        let users = []
        data.forEach((it) => {

            users.push(it.sennderId, it.reciverId)

        })
        // 
        let ids = users.filter((f) => {
            return f !== sender
        })


        // 
        const uniqueid = [...new Set(ids)]
        // 

        const friends = await model.find({ _id: { $in: uniqueid } })
        

        res.send({
            status: true,
            data: friends
        })
    } catch (error) {
        
        res.status(500).send({ message: 'Server error' });
    }
};


exports.getallusers = async (req, res) => {
    try {
        const { searchname } = req.query

        if(searchname==""){
            return res.send({
                status: false,
                data: ""
            })
        }

        const users = await model.find({
            name: {
                $regex: searchname, $options: "i"
            }
        }).select('-password')
        // 
        if (!users.length) {
            res.send({
                status: false,
                data: "no data found"
            })
        }
        else {
            
            const user = users.filter((it) => {
                if (it._id.toString() !== req.user._id.toString()) {
                    
                    return (it)
                }
            })
            // 
            res.send({
                status: true,
                data: user
            })
        }
    } catch (error) {
        
    }
}

exports.getallfriendsusersd = async (req, res) => {
    try {
        const { sender } = req.body
        const data = await chatmodle.find({
            $or: [{ sennderId: sender },
            { reciverId: sender }
            ]
        })
        

        let users = []
        data.forEach((it) => {

            users.push(it.sennderId, it.reciverId)

        })
        
        let ids = users.filter((f) => {
            return f !== sender
        })

        
        const uniqueid = [...new Set(ids)]
        

        const friends = await model.find({ _id: { $in: uniqueid } })
        

        res.send({
            status: true,
            data: friends
        })
    } catch (error) {
        
        res.status(500).send({ message: 'Server error' });
    }
};

exports.updateprofile=async (req, res) =>{
    try {
        const {email,name}=req.body
        const data = await model.findOne({email:email})
        if(data){
            
        if(!req.file){

                const update=await model.updateOne({email:email},{name:name})
                res.status(200).send({status:true,data:update})
            }
            else{
                
                data.profile.publicid && await  cloudinary.uploader.destroy(data.profile.publicid)

                let image = await cloudinary.uploader.upload(req.file.path, {
                    transformation: [
                        { width: 1000, crop: "scale" },
                        { quality: "auto" },
                        { fetch_format: "auto" }
                    ], folder: "chatAppprofileImages"
                })
                const update=await model.updateOne({email:email},{name:name,profile:{url:image.secure_url,publicid:image.public_id}})
                fs.unlink(req.file.path,(err)=>{
                    if(err) throw err
                    
                })
                res.status(200).send({status:true,data:update})
            }
        }
        else{
            res.status(200).send({status:true,data:"user not found"})
        }
    } catch (error) {
        res.status(500).send({ message: 'Server error'+error.message });
    }
}
