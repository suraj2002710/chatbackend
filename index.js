const express=require('express')
const app=express()
const mongoose=require("mongoose")
const cloudinary=require("cloudinary").v2
const redis=require("redis")
const Usersmodel=require("./models/Usersmodel")
const cors=require("cors")
const router=require("./router/Userroute")
const path=require("path")
const FCM=require('fcm-node')
const server_key="AAAAR6dVltk:APA91bG_lgE-_ea5UYvmH407_FDr8nOxugSq-WvVYWSOXmkAVDXVrD7cBKp2kYv_MvJwVLsaG_kxIWosVqK5syRWzSVlTf_0cjJScMSfiyINA8pshOseLYbe9ECKYmdGvl9gnBikp2JE"
require("dotenv").config()
var fcm = new FCM(server_key);

mongoose.connect("mongodb://127.0.0.1:27017/chat").then((res)=>{
    console.log("mongo connect");
}).catch((err)=>{
    console.log(err);
})

app.use('/',express.static(path.join(__dirname + "/upload")))
cloudinary.config({ 
    cloud_name: 'dpmds1cyi', 
    api_key: '388756442354748', 
    api_secret: 'sQIoQ3jti8fDAyHjIlwc96nvBiQ' 
  });

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:["http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://192.168.0.24:3000",
    'http://192.168.0.9:3000',
    'http://192.168.0.14:3000'
],
    credentials:true
}))
app.use("/api",router)
const server= app.listen(process.env.PORT,()=>{
    console.log("server started");
})
const io=require('socket.io')(server,{
    cors:{origin: ["http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://192.168.0.9:3000"
    
],
    credentials:true
}    
})

const users=new Map()
let onlineusers=[]
let offlineusers=[]
io.on('connection',(socket)=>{
    onlineusers=[]
    console.log("connected")
    socket.on("add-user",async(data)=>{
        console.log(data.id);
        users.set(data.id,{socketid:socket.id})
        
        users.forEach((user,i)=>{
            onlineusers.push(i)
        })
        console.log(users);

        // const user=await Usersmodel.updateOne({_id:data.id},{online:true})
        console.log("onlineusers",[...new Set(onlineusers)]);
        if(onlineusers.length){
            io.emit("onlineuser", [...new Set(onlineusers)])
        }


         // find offlineusers in offlineusers
         let updateOfflineuser= offlineusers?.filter((user)=>{
            if(user!==data.id){
                return user
            }
   })


        let i= offlineusers.findIndex(it=>it==data.id)
        //delete userid from offlineusers
        offlineusers.splice(i,1)

        

            //emit offlineuser
            io.emit('offlineuser',[...new Set(updateOfflineuser)])
       
    })

    socket.on("add-friend",(data)=>{
        const {receiver,name,_id,profile,notificationtoken}=data
        console.log(data);
        let socketid= users.get(receiver)
        console.log(socketid);
        if(socketid){
            socket.to(socketid.socketid).emit("friend-add",{name,_id,profile:{url:profile},notificationtoken})
        }
        var message = { 
            to: notificationtoken, 
            notification: {
                title: name, 
                body: `${name} Send friend Request`
            },
        }
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!",err);
            } else {
                console.log("Successfully sent with response: ", response);
                
            }
        });
        
    })

    socket.on('friend-request-accpect',(data)=>{
        const {receiver,name,notificationtoken,msg,_id,profile}=data
        console.log("accpectdata",data);
        const socketid= users.get(receiver)
        if(socketid){
            socket.to(socketid.socketid).emit("friend-request-accpect",{_id,msg})
        }
        var message = { 
            to: notificationtoken, 
            notification: {
                title: name, 
                body: `${name} ${msg}`
            },
        }
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!",err);
            } else {
                console.log("Successfully sent with response Accepcted: ", response);
            }
        });
    })

    socket.on('send-msg',(msg)=>{
        console.log(msg);
        const {notificationtoken,name,createAt}=msg
        console.log(msg);
        let socketid =users.get(msg.receiver_id)
        
        console.log("socketid",socketid);
        if(socketid){
            socket.to(socketid.socketid).emit('recev-msg',msg)
        }

        var message = { 
            to: notificationtoken, 
            notification: {
                title: name, 
                body: `${msg.msg}`
            },
        }
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!",err);
            } else {
                console.log("Successfully sent with response Accepcted: ", response);
            }
        });
    })
    socket.on("videocall-user",(data)=>{
        const {id,receiver,sender,currentUserName}=data
        
        const socketid=users.get(receiver)
        console.log(data);
        if(socketid){
            socket.to(socketid.socketid).emit("incomingvideocall-user",{sender,currentUserName,id})
        }
    })
    socket.on("call-accepected",(dat)=>{
        const {videocallSender,data}=dat
        console.log(dat);
        const socketid=users.get(videocallSender)
        if(socketid){
            socket.to(socketid.socketid).emit("call-accepect",{data})
        }
    })

    socket.on("voicecall-user",(data)=>{
        const {id,receiver,sender,currentUserName}=data
        
        const socketid=users.get(receiver)
        console.log(data);
        if(socketid){
            socket.to(socketid.socketid).emit("incomingvoicecall-user",{sender,currentUserName,id})
        }
    })
    socket.on("voicecall-accepected",(dat)=>{
        const {voicecallSender,data}=dat
        console.log(dat);
        const socketid=users.get(voicecallSender)
        if(socketid){
            socket.to(socketid.socketid).emit("voicecall-accepect",{data})
        }
    })
    // socket.on('disconnectuser',(data)=>{
    //     console.log(data);
    //    let updateuser= onlineusers?.filter((user)=>{
    //     if(user!==data){
    //         return user
    //     }
    //    })
    //    let i= onlineusers.findIndex(it=>it==data)
    //    onlineusers.splice(i,1)
    //     console.log("updateuser",onlineusers);
    //     io.emit("onlineuser",[...new Set(updateuser)])
    // })
    socket.on('disconnect',async()=>{
        console.log("disconnected",socket.id);
        let userid

        //find userid in users Map
        users.forEach((user,i)=>{
            console.log("i",i,"socketid",user);
            if(user?.socketid==socket.id){
                userid=i
                console.log(i);
            }
            // console.log(i,user);
        })

        // find onlineuser in onlineusers
        let updateuser= onlineusers?.filter((user)=>{
                if(user!==userid){
                    return user
                }
       })

       // delete userid from users Map
        users.delete(userid)

        // find index in onlineusers
        let i= onlineusers.findIndex(it=>it==userid)
        //delete userid from onlineusers
        if(i!==-1){
            console.log(i,userid);

            // onlineusers.splice(i,1)
            offlineusers.push(userid)
        }

        // push offlineuser to onlineusers
        

        console.log("updateuser",[...new Set(onlineusers)]);
        // emit onlineuser
        // io.emit("onlineuser",[...new Set(updateuser)])    

        //emit offlineuser
       io.emit('offlineuser',[...new Set(offlineusers)])
       console.log("offlineusers",offlineusers);
        // const data= await Usersmodel.updateOne({_id:userid},{online:false})
        // console.log(data);
    })
})


























