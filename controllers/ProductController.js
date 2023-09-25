import ModelsWorker, {removeUserProductsType} from "../utils/Model/modelsWorker.js";
import {compressImage, getFileExtensionFromFilename} from "../utils/SomeUtils/fsWorker.js";
import ProductModel from "../models/ProductModel.js";
import {generateUniqueCode, getImagesOptions} from "../utils/SomeUtils/someFunctions.js";
import UserModel from "../models/UserModel.js";

import {addUserProductsType} from "../utils/Model/modelsWorker.js";

import pkg from "lodash";
const {get} = pkg;


export const productTypes = ["All", "Clothes", "Cosmetics", "Medicine", "Goods for children", "Phones", "Appliances"];


const modelWorker = new ModelsWorker(ProductModel);

class ProductController {
    createProduct = async (req, res) => {
        try {
            const ownerId = req.userId;
            const body = req.body;


            // const decodedImages = [];
            // if (req.body.files){
            //     const files = req.body.files;
            //    decodedImages.push(..._decodingImagesFromArray(files))
            // }

            const file = req.file;


            const ext = getFileExtensionFromFilename(file.originalname);

            const productCoverBuffer =
                await compressImage(file.buffer, ext)

            if (!productCoverBuffer) {
                return res.status(500).json({success: false, message: "Server error"});
            }


            const flag = await addUserProductsType(ownerId, body.productType);

            if (!flag) {
                return res.status(500).json({success: false, message: "User cant find"});
            }

            const code = generateUniqueCode();

            const doc = new ProductModel({
                ...body,
                productCover: {
                    data: productCoverBuffer,
                    ext: ext,
                },
                code: code,
                owner: ownerId,
            });


            const product = await doc.save();
            res.status(200).json({success: true, product: product});

        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: 'Error, try again later please'
            })

        }
    }
    getProduct = async (req, res) => {
        try {
            const productId = req.params.id;
            const userId = req.query.userId;

            console.log(userId);


            const product = await ProductModel.findById(productId);

            if (!product) {
                return res.status(404).json({success: false, message: "Cant find"});
            }


            if (userId && product.owner.toString() !== userId) {
                product.viewsCount++;
                await product.save();
            }


            const owner = await UserModel
                .findById(product.owner)
                .select("_id firstname lastname rating userAvatar");

            return res.status(200).json({product, owner});
        } catch (e) {
            console.log(e)
            res.status(500).json({
                message: 'Error, try again later please'
            })
        }
    }
    removeProduct = async (req, res) => {
        const productId = req.params.id;
        const userId = req.userId;


        try {
            await ProductModel.findOneAndRemove({
                _id: productId
            })


            await removeUserProductsType(userId, req.body.productType);

            return res.status(200).json({success: 'true'})
        } catch (e) {
            console.log(e);
            return res.json({success: 'false', message: e})
        }
    }
    editProduct = async (req, res) => {
        try {
            const productId = req.params.id;


            const {imageOperation, ...body} = req.body;


            const imageData
                = getImagesOptions(req.file, imageOperation, "productCover");

            //задаю только те значение, которые можно поменять

            modelWorker.setImageWorkerOptions(imageData.options.operation, imageData.options.imageFieldName);

            const result = await modelWorker.findAndUpdate(productId, body, imageData.image);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(400).json({success: false, message: e})
        }
    }

    getProducts = async (req, res) => {
        try {
            const params = req.query;

            const filterParams = {
            };

            if (params.title){
                filterParams.title = { $regex: new RegExp(params.title, 'i') }
            }
            if (params.code){
                filterParams.code = { $regex: new RegExp(params.code, 'i') }
            }

            if (params.priceFilter === "free") {
                filterParams.price = 0;
            } else {
                const priceFilter = {
                    $gte: +params.minPrice,
                    $lte: +params.maxPrice,
                };
                filterParams.price = priceFilter;
            }

            if (params.productsType && params.productsType !== 'All') {
                filterParams.productType = params.productsType;
            }

            const products = await ProductModel.find(filterParams);

            if (!products) return res.status(200).json({products: []});

            const sortingProducts = this.#service.sortProducts(products, params.filter, params.priceFilter);

            return res.status(200).json({products: sortingProducts});

        } catch (e){
            console.log(e);
            return res.status(500).json({success: false, message: "ServerError"})
        }

    }

    getProductsTypesWithPrice = async (req, res) => {
        try {
            const result = await ProductModel.aggregate([
                {
                    $group: {
                        _id: '$productType',
                        maxPrice: { $max: '$price' },
                        minPrice: { $min: '$price' },
                        productType: { $first: '$productType' },
                    },
                },

            ]);

            const resultMap = [];

            let overallMinPrice = Number.MAX_VALUE;
            let overallMaxPrice = Number.MIN_VALUE;

            result.forEach((item) => {
                resultMap.push({
                    name: item.productType,
                    minPrice: item.minPrice,
                    maxPrice: item.maxPrice,
                });

                overallMinPrice = Math.min(overallMinPrice, item.minPrice);
                overallMaxPrice = Math.max(overallMaxPrice, item.maxPrice);
            });

            resultMap.unshift({
                name: 'All',
                minPrice: overallMinPrice,
                maxPrice: overallMaxPrice,
            });

            return res.status(200).json({
                success: true,
                categoryWithPrice: resultMap
            })
        } catch (e) {
            console.log(e);
            return res.status(500).json({
                success: false,
                message: "Server error"
            })
        }
    }

    getProductTypes = async (req, res) => {
        return res.status(200).json({types: productTypes});
    }


    #service = {
        sortProducts: (products, field, priceField) => {
            const sortFields = {
                mostOld: "_createdAt",
                mostNew: "_createdAt",
                mostLikes: "rating.likes.length",
                mostViews: "viewsCount",
            }
            const sortPriceFields = {
                mostExpensive: "price",
                mostCheaper: "price",
            }

            const filterField = sortFields[field];

           let sortedProducts =  this.#service.sortArray(products, filterField);


            if (field === "mostNew"){
                sortedProducts = [...sortedProducts].reverse();
            }

            if (priceField === "free" || !priceField){
                return sortedProducts;
            }

            const priceSortField = sortPriceFields[priceField];
            const priceSortedProducts = this.#service.sortArray(sortedProducts, priceSortField);

            if (priceField === "mostCheaper"){
                return priceSortedProducts.reverse();
            }
            return priceSortedProducts;
        },

        sortArray(array, filter){
            return array.sort((a,b)=>{

                const valueA = Number(get(a, filter))
                const valueB = Number(get(b, filter));


                if (valueA < valueB) {
                    return 1;
                } else if (valueA > valueB) {
                    return -1;
                }
                return 0;
            });
        }

    }

}

export const getUserProducts = async (ownerId) => {
    try {
        return await ProductModel.find({owner: ownerId}).populate('User').exec();
    } catch (e) {
        return false;
    }
}


export default new ProductController;