import {body} from "express-validator"


const commentValidator = [
    body('title','Title must been form 6 to 15 letters.').isLength({min: 6, max: 20}).optional(),
    body('text', 'Min length is 3 letters.').isLength({max: 382}),
    body('rating').not().exists(),

    body().custom((value, {req})=>{
        if (req.files.length > 3){
            throw new Error('max 3')
        }
    })
]

export default commentValidator;