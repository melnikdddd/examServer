import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            default: "",
        },
        description: {
            type: String,
            required: true,
            default: "",
        },
        productType: {
            type: String,
            required: true,
            default: "",
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            default: 0
        },
        characteristics:{
            type: String,
            default: "",
            required: true,
        },
        rating: {
            likes: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: 'UserProfile',
                default: [],
                set: function (users) {
                    return Array.from(new Set(users));
                }
            },
            dislikes: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: 'UserProfile',
                default: [],
                set: function (users) {
                    return Array.from(new Set(users));
                }
            },
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        productCover: {
            data: {
                type: Buffer,
                default: '',
            },
            ext: {type: String, default: ''}
        },
    },{
        timestamps: true,
        strictPopulate: false,
    }
)



export default mongoose.model('Product', ProductSchema)