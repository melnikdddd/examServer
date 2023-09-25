import twilio from "twilio";
import dotenv from "dotenv"
dotenv.config();

const DEFAULT_FROM = "iMarket";


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const _sendMessage =  (body, to) =>{
    client.messages
        .create({
            body: body,
            from: '+13156418414',
            to: to
        })
        .then(message => console.log(message.sid))
}