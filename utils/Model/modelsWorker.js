import {compressImage, getFileExtensionFromFilename} from "../SomeUtils/fsWorker.js";
import UserModel from "../../models/UserModel.js";
import CommentModel from "../../models/CommentModel.js";
import ProductModel from "../../models/ProductModel.js";

import bcrypt from "../auth/bcrypt.js";
import userModel from "../../models/UserModel.js";


class ModelsWorker {
    constructor(model) {
        this.model = model;
        this.imageWorker = null;
    }

    setImageWorkerOptions = (operation, imageFieldName) => {
        if (!operation) {
            return false;
        }

        this.imageWorker = new this.#ImagesWorker;
        this.imageWorker.options = {operation: operation, imageFieldName: imageFieldName};
        this.imageWorker.options.isCanWork = true;
    }

    findAndUpdate = async (id, data, image_s) => {
        const document = await this.model.findById({_id: id});

        if (!document) {
            return {success: false, message: "document cant find"}
        }

        if (data.password) {
            data.hashPassword = await bcrypt.genPassword(data.password);
            delete data.password;
        }

        if (data.productType) {
            const flag = await
                replaceUserProductType(data.userId, document.productType, data.productType);
            if (!flag) {
                return {success: false, message: "User products type cant update"};
            }
        }

        if (data.listType === "like" || data.listType === "dislike") {
            const doc = this.#updateRating(document, data.userId, data.listType, data.operation);
            if (doc) {
                await doc.save();
                return doc.rating;
            }
            return false;
        }

        if (data.listType === "favoritesUsers" || data.listType === "blockedUsers" || data.listType === "reports") {
            const doc = this.#updateArray(document, {
                userId: data.userId,
                listType: data.listType,
                operation: data.operation
            });

            if (doc) {
                doc.save();
                return doc.listType;
            }
            return false;
        }


        if (this.imageWorker && this.imageWorker.options.isCanWork) {
            const result = await this.imageWorker.goWork(image_s);

            if (result) {
                document[this.imageWorker.options.imageFieldName] = result;
                this.imageWorker.clearOptions();
            }

        }

        for (const key in data) {
            document[key] = data[key];
        }

        document.save();
        return {success: true, document}

    }

    findAndRemove = async (id) => {
        const modelName = this.model.modelName + "Model";

        if (modelName !== "CommentModel") {
            const flag = !await this.#clearDependency[modelName](id)
            if (!flag){
                return  false;
            }
        }
        return !!(await this.model.findOneAndDelete({_id: id}));

    }
    #updateRating = (document, userId, ratingType, ratingOperation) => {

        const likesFilter = document.rating.likes.filter(rate => rate.toString() !== userId.toString());
        console.log(likesFilter);
        if (ratingType === "like" && ratingOperation === "add") {
            likesFilter.push(userId);
        }

        const dislikesFilter = document.rating.dislikes.filter(rate => rate.toString() !== userId.toString());

        if (ratingType === "dislike" && ratingOperation === "add") {
            dislikesFilter.push(userId);
        }

        document.rating = {likes: likesFilter, dislikes: dislikesFilter}

        console.log(document.rating);

        return document;
    }
    #updateArray = (document, {userId, listType, operation}) => {
        const filteredDocument = document[listType].filter(element => element === userId);

        if (operation === "add") {
            filteredDocument.push(userId);
        }

        document[listType] = filteredDocument;
        return document;
    }

    #ImagesWorker = class extends ModelsWorker {
        constructor(modelId, model) {
            super(modelId, model);
        }

        options = {
            isCanWork: false,
            operation: null,
            imageFieldName: null,
        }
        goWork = async (image_s) => {
            const {operation, imageFieldName} = this.options;

            // const goOperation = imageFieldName === "images" ? this.arrayImageOperations[operation] :

            const goOperation = this.singleImageOperations[operation];

            const operationResult = await goOperation(image_s);

            if (!operationResult) {
                return false;
            }
            return operationResult;
        }

        clearOptions = () => {
            this.options.isCanWork = false;
            this.options.operation = null;
            this.options.imageFieldName = null;

        }


        singleImageOperations = {
            replace: async (image) => {
                const ext = getFileExtensionFromFilename(image.originalname);
                const compressedImageBuffer = await compressImage(image.buffer, ext);
                if (!compressedImageBuffer) {
                    return false;
                }
                return {data: compressedImageBuffer, ext: ext}
            },

            remove: () => {
                return {data: '', ext: ''}
            },
        }

        // arrayImageOperations = {
        //     add: (array, images) => {
        //         const decodedImages = _decodingImagesFromArray(images);
        //         return decodedImages.length + array.length > 10 ? false : array.push(decodedImages);
        //     },
        //     remove: (array, indexes) => {
        //         return array.filter(index => !indexes.includes(index));
        //     },
        //     replace: (array, images, indexes) => {
        //         const newArray = [...array];
        //         return indexes.forEach((index, imagesIndex) => {
        //             newArray[index] = images[imagesIndex]
        //         })
        //     }
        // }


    }

    #clearDependency = {
        UserModel: async (userId) => {
            return !(!await ProductModel.deleteMany({owner: userId})
                && !await CommentModel.deleteMany({owner: userId})
                && !await CommentModel.deleteMany({user: userId}))
                && ! await deleteUserAndUpdateRelatedUsers(userId)
        },
        ProductModel: async (productId) => {
            return !await CommentModel.deleteMany({product: productId})
        }
    }

}



export const _checkDuplicate = async (valueType, value) => {
    // true -  exists
    //false - dont exists
    const user = await UserModel.findOne({[valueType]: value});
    return !!user;
}
export const addUserProductsType = async (userId, productType) => {
    const filter = {_id: userId};
    const update = {$inc: {[`productsType.${productType}`]: 1}};
    const options = {new: true}; // upsert: true создаст документ, если его нет

    try {
        const user = await userModel.findOneAndUpdate(filter, update, options);
        return user;

    } catch (e) {
        return false; // Обработка ошибок
    }
}
export const removeUserProductsType = async (userId, productType) => {
    const filter = {_id: userId};
    const update = {$unset: {[`productsType.${productType}`]: -1}};
    const options = {new: true};

    try {
        const user = await userModel.findOneAndUpdate(filter, update, options);
        if (user && user.productsType && user.productsType[productType] <= 0) {
            delete user.productsType[productType];
            await user.save();
        }
        return user;
    } catch (e) {
        return false;
    }
}
export const replaceUserProductType = async (userId, oldType, newType) => {
    let flag = await addUserProductsType(userId, newType);
    if (!flag) {
        await removeUserProductsType(userId, newType);
        return flag;
    }
    flag = await removeUserProductsType(userId, oldType);
    if (!flag) {
        await addUserProductsType(userId, oldType)
    }
    return flag;
}


const deleteUserAndUpdateRelatedUsers = async (userIdToDelete) => {
    try {
        const usersToUpdate = await UserModel.find({
            $or: [
                { favoritesUsers: userIdToDelete },
                { blockedUsers: userIdToDelete },
            ],
        });

        if (!usersToUpdate || usersToUpdate.length === 0) {
            return true;
        }

        const updatedUsersPromises = usersToUpdate.map(async (user) => {
            if (user.favoritesUsers.length !== 0) {
                user.favoritesUsers = user.favoritesUsers.filter(
                    (id) => id !== userIdToDelete
                );
            }
            if (user.blockedUsers.length !== 0) {
                user.blockedUsers = user.blockedUsers.filter(
                    (id) => id !== userIdToDelete
                );
            }
            await user.save();
        });

        await Promise.all(updatedUsersPromises);

        await UserModel.findByIdAndDelete(userIdToDelete);

        return true;
    } catch (error) {
        console.error(`${error.message}`);
        return false;
    }
};



export default ModelsWorker;




