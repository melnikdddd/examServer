import express from "express"
import {loginValidation} from "../validations/UserValidator.js";
import AuthController from "../controllers/AuthController.js";
import {registrationValidation} from "../validations/RegistrationValidator.js";
import CheckAuth from "../utils/auth/checkAuth.js";
const AuthRouter = express.Router();

AuthRouter.post('/registration', registrationValidation,  AuthController.registration);
AuthRouter.post('/login', loginValidation, AuthController.login);
AuthRouter.post('/verification', AuthController.verification);
AuthRouter.post('/checkDuplicate',AuthController.checkDuplicate)
AuthRouter.post('/checkPassword', CheckAuth, AuthController.checkPassword);

export default AuthRouter;