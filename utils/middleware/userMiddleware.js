import mongoose from "mongoose";

export const _updateUser = async (req, res, next) => {
        const ownerId = req.userId;
        const body = req.body;
        const userStringId = req.params.id;

        const userPropertiesTypes = ['blockedUsers', 'favoritesUsers', 'like', 'dislike', 'reports'];


        if (ownerId !== userStringId && userPropertiesTypes.includes(body.listType)){
                const userId = new mongoose.Types.ObjectId(body.userId);
                req.body = {
                        userId : userId,
                        listType: body.listType,
                        operation : body.operation
                };
        }
        next();

}