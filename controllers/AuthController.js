import {validationResult} from "express-validator";
import UserModel from "../models/UserModel.js";
import {_checkDuplicate} from "../utils/Model/modelsWorker.js";
import EmailWorker from "../utils/contacts/emailWorker.js";
import bcrypt from "../utils/auth/bcrypt.js";
import {emailStrings, userLoginString} from "../utils/SomeUtils/strings.js";


import dotenv from "dotenv"
import Jwt from "../utils/auth/jwt.js";
import {checkPassword} from "../utils/auth/utils.js";
import {getUserProducts} from "./ProductController.js";

dotenv.config();


class AuthController {
    registration = async (req, res) => {
        try {
            const errorFields = [];

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({success: false, message: "Wrong data"});
            }
            const body = req.body;

            if (body.nickname){
                if (await _checkDuplicate(["nickname"], body.nickname)) {
                    errorFields.push("nickname")
                }
            }
            if (body.email) {
                if (await _checkDuplicate(["email"], body.email)) {
                    errorFields.push("identity")
                }
            }
            else if (body.phoneNumber) {
                if (await _checkDuplicate(["phoneNumber"], body.phoneNumber)) {
                    errorFields.push("identity")
                }
            }

            if (errorFields.length > 0) {
                return res.status(409).json({success: "Duplicate error", errorFields: errorFields})
            }


            const {password, ...userData} = body;
            const hash = await bcrypt.genPassword(password);


            const doc = new UserModel(
                {...userData, hashPassword: hash});


            const userId = doc._id;
            const token = Jwt.sign(userId);


            await doc.save();

            const {hashPassword, latestOnline, __v, updatedAt, ...user} = {...doc._doc}

            res.status(200).json({success: true, user: user, token: token});

        } catch (error) {
            console.log(error)
            res.status(500).json({success: false, message: "Something going wrong."});
        }
    }
    login = async (req, res) => {
        try {
            const password = req.body.password;
            const identity = req.body?.email || req.body.phoneNumber;
            const identityType = req.body?.email ? "email" : "phoneNumber";

            const user = await UserModel.findOne({[identityType]: identity}).select(userLoginString);


            if (!user) {
                return res.status(404).json({
                    success: "UserProfile cant find",
                })
            }


            const isValidPass = await bcrypt.readHashPassword(password, user.hashPassword);


            if (!isValidPass) {
                return res.status(401).json({
                    success: 'Invalid login or password'
                })
            }

            const userId = user._id;

            const products = await getUserProducts(userId);

            const token = Jwt.sign(userId);

            const {hashPassword, ...returnedUser} = {...user._doc}


            res.json({
                success: true,
                user: returnedUser,
                products: products,
                token: token
            })

        } catch (error) {
            console.log(error);
            res.status(404).json({error});
        }
    }
    checkDuplicate = async (req, res) => {
        const {valueType, value} = req.body;
        const flag = await _checkDuplicate(valueType, value);
        res.status(200).json({flag: flag});
    }
    checkPassword = async (req, res) => {
        try {
            const userId = req.userId;
            const {password} = req.body;
            if (!await checkPassword(password, userId)) {
                return res.status(401).json({success: false, message: "Invalid password"});
            }
            res.status(200).json({success: true});

        } catch (error) {
            res.status(500).json({success: false, message: "Server error"});
        }

    }
    verification = async (req, res) => {
        const {verificationType} = req.body;
        if (verificationType === 'email') {

        } else if (verificationType === 'phoneNumber') {

        }
        return res.status(400).json({
            message: "Bad request"
        })
    }

    #verificationService = class {
        verificationCode = '';
        sendEmailCode = async (code, email) => {
            this.verificationCode = _genSixDigitCode();
            const subject = '[' + this.verificationCode + ']';

            return await EmailWorker.sendMail(email, subject, this.#messagesText.email)
        }
        sendPhoneCode = async (code, ...params) => {
            this.verificationCode = _genSixDigitCode();
        }

        #messagesText = {
            email: emailStrings.verificationCode(this.verificationCode),
        }


    }


}


export default new AuthController;

