import {body} from "express-validator";
import {productTypes} from "../controllers/ProductController.js";
const checkObjLength = (obj, maxLength) => {
    return Object.keys(obj).length < maxLength;
}
const checkObjPropertyLength = (obj) =>{
    for (let key in obj){
        if (typeof obj[key] !=='string' && obj[key].length > 120){
           return false;
        }
    }
    return true;
}

const productValidator = [
    body('title','Title must been form 6 to 40 letters.').isLength({min: 5, max: 40}).optional(),
    body('description', 'Min length is 3 letters.').isLength({min:40, max: 1000}),
    body("characteristics").isLength({min: 25, max: 1000}).optional(),
    body('imageOptions',"ImageData error").isObject(),
    body('rating').not().exists(),
    body('price','Invalid price number').isNumeric().custom(price =>{
        if (price.numeric > 5000000 || price.numeric < 0){
            throw new Error('Invalid price number')
        }
    }),
    body("productType", "Invalid type").isString().custom(type=>{
        if (!productTypes.includes(type)){
            throw new Error("Invalid type");
        }
    }),
    // body('characteristics').isObject().custom(obj=>{
    //     if (!checkObjLength){
    //         throw new Error('So many characteristics')
    //     }
    //     if (!checkObjPropertyLength(obj)){
    //         throw new Error('Invalid characteristic');
    //     }
    // }).optional(),
    body().custom((value, {req})=>{
        if (req.files.length > 9){
            throw new Error('max 9')
        }
    })
]

export default productValidator