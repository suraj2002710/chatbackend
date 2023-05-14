const nodemailer=require('nodemailer')

exports.transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:"587",
    secure:false,
    auth:{
        user:"surajaheer448@gmail.com",
        pass:"mamokewfitjsnxwt"
    }
})