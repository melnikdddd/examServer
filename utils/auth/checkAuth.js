import dotenv from "dotenv";
import Jwt from "./jwt.js";
dotenv.config()

const _checkAuth = (req, res, next) =>{
    const authorizationToken = req.headers.authorization;
    if (!authorizationToken){
        return res.status(403).json({message: 'You are is not auth'});
    }

    //get token form header and split him
    const token = authorizationToken.split(' ')[1];

    if(!token){
        return res.status(403).json({message: 'You are is not auth'});
    }

    try {
        //декодирование и отправка его дальше в работу
        const decoded =  Jwt.verify(token);

        req.userId = decoded._id;
        next();

    }catch (err){
        console.log("jwt error");
        return res.status(403).json({
            message: err
        })
    }
}

export default _checkAuth;