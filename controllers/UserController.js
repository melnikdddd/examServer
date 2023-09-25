import UserModel from "../models/UserModel.js";
import {getUserProducts} from "./ProductController.js";
import {usersString, userString} from "../utils/SomeUtils/strings.js";
import ModelsWorker from "../utils/Model/modelsWorker.js";
import {_checkFieldsOnDuplicate, checkPassword} from "../utils/auth/utils.js";
import userModel from "../models/UserModel.js";
import {getImagesOptions} from "../utils/SomeUtils/someFunctions.js";

import pkg from "lodash";

const {get} = pkg;

const modelWorker = new ModelsWorker(UserModel);


class UserController {
    removeUser = async (req, res) => {
        const userId = req.userId;
        const {password} = req.body;

        if (!await checkPassword(password, userId)) {
            return res.status(401).json({success: false, message: "Invalid password"});
        }

        if (await modelWorker.findAndRemove(userId)) {
            return res.json({success: true,})
        }
        return res.json({success: false})
    }
    updateUser = async (req, res) => {
        try {
            const userId = req.params.id;

            const {imageOperation, ...body} = req.body;

            const errorsFields =
                await _checkFieldsOnDuplicate(["nickname", "email", "phoneNumber"], body);

            if (errorsFields.length > 0) {
                return res.status(409).json({success: false, errorsFields: errorsFields});
            }

            //создаю объект настроек для дальнейшей работы с файлом
            const imageData
                = getImagesOptions(req.file, imageOperation, "userAvatar");

            //задаю эти настройки в ImageWorker
            modelWorker.setImageWorkerOptions(imageData.options.operation, imageData.options.imageFieldName);

            //вызвыаю общий для всех моделей метод апдейта, уже с настройками для записи файла
            const result = await modelWorker.findAndUpdate(userId, body, imageData.image);
            return res.status(200).json({success: true});

        } catch (error) {

            res.status(500).send("Try later");
        }
    }
    getUser = async (req, res) => {
        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).json({success: 400, message: "Bad request."})
            }

            const user = await UserModel.findById(userId).select(userString);


            if (!user) {
                return res.status(404).json({success: false, message: 'UserProfile can`t find.'});
            }

            const products = await getUserProducts(userId);


            res.status(200).json({user: user, products: products});

        } catch (error) {
            res.status(500).send("Try later");
        }
    }

    getUserByToken = async (req, res) => {
        const userId = req.userId;

        if (!userId) return res.status(400).json({success: false, message: "Bad request."});

        const user = await UserModel.findById(userId).select(userString);

        if (!user) {
            return res.status(404).json({success: false, message: 'UserProfile can`t find.'});
        }

        const products = await getUserProducts(userId)


        return res.status(200).json({success: true, user: user, products: products});
    }
    getUsersInChat = async (req, res) => {
        try {
            const { usersIds } = req.body;

            const users = await UserModel.find({ _id: { $in: usersIds } }).select(
                "firstname lastname userAvatar nickname"
            );

            const usersWithNull = usersIds.map((userId) => {
                const foundUser = users.find((user) => user._id.toString() === userId.toString());
                return foundUser || null;
            });


            return res.status(200).json({ success: true, users: usersWithNull });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Server error" });
        }
    };
    getUsers = async (req, res) => {
        try {
            const params = req.query;

            const filterParams = {
                nickname: {$regex: new RegExp(params.nickname, 'i')},
            };

            if (params.country) {
                filterParams.country = params.country;
            }

            if (params.city) {
                filterParams.city = params.city;
            }

            if (params.users) {
                filterParams._id = {$in: new Array(params.users)};
            }
            if (params.productsType && params.productsType !== 'All') {
                filterParams[`productsType.${params.productsType}`] = {$exists: true};
            }

            const users = await UserModel.find(filterParams).select(usersString)

            if (!users) return res.status(200).json({users: [], success: true});

            const sortingUsers = this.#service.sortUsers(users, params.filter);

            return res.status(200).json({users: sortingUsers});
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: "Server error"});
        }

    }

    #service = {
        sortUsers: (users, field) => {
            const sortFields = {
                mostSales: "deals.sales",
                mostOld: "_createdAt",
                mostLikes: "rating.likes.length",
            }

            const filterField = sortFields[field];

            return users.sort((a, b) => {

                const valueA = Number(get(a, filterField))
                const valueB = Number(get(b, filterField));


                if (valueA < valueB) {
                    return 1;
                } else if (valueA > valueB) {
                    return -1;
                }
                return 0;

            })

        },
    }
}


export const updateChatsInfo = async (ownId, data) => {
    const {chatId, userId, message} = data;
    const read = data?.read || false;

    const user = await UserModel.findOne({_id: ownId});
    if (!user) {
        return false;
    }

    const chatInfo = {
        chatId: chatId,
        userId: userId,
        read: read,
        lastMessage: message
    }

    const chatIndex = user.chatsInfo.findIndex(chat => chat.chatId.toString() === chatId.toString());

    if (chatIndex !== -1) {
        user.chatsInfo[chatIndex] = chatInfo;
    } else {
        user.chatsInfo.push(chatInfo)
    }

    await user.save();
    return true;
}

export const setOnline = async (userId) => {
    await UserModel.findOneAndUpdate({_id: userId}, {isOnline: true})
}

export const setOffline = async (userId) => {
    await UserModel.findOneAndUpdate({_id: userId}, {isOnline: false, lastOnline: new Date()});
}

export const readChat = async (data) => {
    const {userId, chatId} = data;

    try {
        const user = await userModel.findOne({_id: userId});

        if (!user) {
            console.log("User not found");
            return false;
        }

        const updatedChatsInfo = user.chatsInfo.map(chat => {
            if (chat.chatId.toString() === chatId.toString()) {
                return {
                    ...chat,
                    read: true
                };
            }
            return chat;
        });

        user.chatsInfo = updatedChatsInfo;

        await user.save();
        return true;
    } catch (error) {
        console.error("Error reading chat:", error);
        return false;
    }
}
export default new UserController;
