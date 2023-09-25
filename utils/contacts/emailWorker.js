import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();
class EmailWorker {
    constructor() {
         this.mailTransporter = nodemailer.createTransport({
             service: "gmail",
             auth :{
                 user: process.env.GOOGLE_USERNAME,
                 pass: process.env.GOOGLE_PASSWORD,
             },

         })
    }

     sendMail =  async (to, subject, html) =>{
        const options = {
            from: process.env.EMAIL_ADDRESS,
            to: to,
            subject: subject,
            html: html
        }

            await this.mailTransporter.sendMail(options, (reportError, info) =>{
                return !reportError;
            })
    }
}

export default new EmailWorker;