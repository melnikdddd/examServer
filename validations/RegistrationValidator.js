import {body} from "express-validator";

export const registrationValidation = [
    body('password','Password must been form 6 to 15 letters.').isLength({min: 6, max: 15}),
    body('firstname', 'Min length is 3 letters.').isLength({min: 3, max: 15}),
    body('lastname', 'Min length is 3 letters.').isLength({min: 3, max: 15}),
    body("nickname").isString().isLength({min: 3,max: 16}),
    body('email').
    optional()
        .isEmail()
        .withMessage('Invalid email address'),

    body('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Invalid phone number'),

    body()
        .custom((value, { req }) => {
            if (!req.body.email && !req.body.phoneNumber) {
                throw new Error('Either email or phoneNumber is required');
            }
            return true;
        }),
];

export const loginValidation = [
    body('email','Invalid email address.').isEmail(),
    body('password','Password must been form 5 to 15 letters.').isLength({min: 6, max: 15}),
]