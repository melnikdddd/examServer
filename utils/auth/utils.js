import userModel from "../../models/UserModel.js";
import bcrypt from "./bcrypt.js";
import {_checkDuplicate} from "../Model/modelsWorker.js";

export const checkPassword = async (password, userId) =>{
    const user = await userModel.findById(userId);
    if (!user) return  false;
    const hashPassword = user.hashPassword;

    return await bcrypt.readHashPassword(password, hashPassword);
}


export const _checkFieldsOnDuplicate = async (arrayOfFieldsNames, body) => {
    const errorsFields = [];

    for (const field of arrayOfFieldsNames) {
        if (body.hasOwnProperty(field)) {
            if (await _checkDuplicate(field, body[field])) {
                errorsFields.push(field);
            }
        }
    }

    return errorsFields;
}