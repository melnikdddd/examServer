import express from "express";
import _checkAuth from "../utils/auth/checkAuth.js";
import ProductController from "../controllers/ProductController.js";
import ProductValidator from "../validations/ProductValidator.js";
import multer from "multer";

const ProductRouter = express.Router();
const upload = multer();

ProductRouter.route('/').get(ProductController.getProducts)

ProductRouter.route('/types').get(ProductController.getProductTypes);
ProductRouter.route('/typesWithPrice').get(ProductController.getProductsTypesWithPrice);


ProductRouter.route('/:id')
    .get(ProductController.getProduct)
    .patch(_checkAuth, ProductValidator, upload.single('productCover'), ProductController.editProduct)
    .delete(_checkAuth, ProductController.removeProduct);

ProductRouter.route('/')
    .post(_checkAuth, ProductValidator, upload.single('productCover'), ProductController.createProduct)



export default ProductRouter;