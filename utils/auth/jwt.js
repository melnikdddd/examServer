import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class Jwt  {
    #secretKey = process.env.JWT_PRIVATE_KEY;

    verify(jwtString){
       return  jwt.verify(jwtString, this.#secretKey);
    }
    sign(id){
        return jwt.sign(
            {
                _id: id,
            }, this.#secretKey,{expiresIn: '30d'});

    }

}

export default new Jwt;