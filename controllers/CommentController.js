import CommentModel from "../models/CommentModel.js";
import {validationResult} from "express-validator";
import ModelsWorker from "../utils/Model/modelsWorker.js";

const modelWorker = new ModelsWorker(CommentModel);

class CommentController {
    getAll = async (req, res) =>{
        try{
            const {model, id} = req.params;
            const comments = await CommentModel.find({[model]: id}).exec();

            return res.json({...comments})

        }catch (error){
            res.status(500).json({message: 'Error, try again later please'})
        }
    }
    removeComment = async (req, res) =>{
          const commentId = req.params.id;
          if(await modelWorker.findAndDelete(commentId)){
              return res.return({success: true})
          }
          res.status(500).json({success: false})
    }
    editComment = async (req, res) =>{
        const commentId = req.params.id;
        const {rating, ...body} = req.body;

        const images = body.file || null;
        const imagesOptions = {...body.imagesOptions, images, operationType: "array"}

       if (await modelWorker.findAndUpdate(commentId, body, imagesOptions)) {
           return res.json({message: true})
       }
        return res.status(500).json({message: false})
    }
    createComment = async (req, res) => {
        try {
            const errors = validationResult(req);
            if (errors){
                return res.status(400).json({message: 'Request body is missing',});
            }

            const {rating, ...body} = req.body;

            const doc = new CommentModel(...body)
            await doc.save();

            res.json({...doc});
        }catch (error){
            res.status(400).json({
                message: 'Something goes wrong!'
            })
        }
    }
}
export default new CommentController;