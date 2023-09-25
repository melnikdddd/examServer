import bcrypt from "bcrypt";
import dotenv from "dotenv"

dotenv.config();

const Bcrypt ={
    secretNumber: process.env.BCRYPT_NUMBER,

    genPassword: async function (password) {

        const salt = await bcrypt.genSalt(+this.secretNumber);

        return await bcrypt.hash(password, salt);
    },
    readHashPassword: async function (password, hashPassword){
        return await bcrypt.compare(password, hashPassword);
    }
}

export default  Bcrypt;