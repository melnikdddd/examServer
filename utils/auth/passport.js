import passport from "passport"
import passportJwt from "passport-jwt"
import dotenv from "dotenv";

dotenv.config()

const JWTStrategy = passportJwt.Strategy;
const extreactJWT = passportJwt.ExtractJwt;

const options = {
    jwtFromRequest: extreactJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_PRIVATE_KEY,
}
passport.use(
    new JWTStrategy(options, )
)