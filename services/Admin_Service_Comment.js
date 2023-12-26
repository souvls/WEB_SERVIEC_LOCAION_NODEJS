const express = require('express');
const router = express.Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *       properties:
 *         _id:
 *           type: objectId
 *           description: Tự động tạo _id của comment
 *         user_id:
 *           type: objectId
 *         location_id:
 *           type: objectId
 *         message: 
 *           type: string
 *           description: Nội dung bình luận
 *         create_at:
 *           type: date
 *           description: Ngày bình luận
 *         status:
 *           type: boolean
 *           description: Tình trạng bình luận (duyệt/chưa)
 */ 
router.delete("auth/comments",async (req,res)=>{
    const Comemnt = require('../models/Comment');
    console.log('shjhsfj');
    // await Comemnt.findByIdAndDelete(id).then(()=>{
    //     console.log('=> admin delete coment');
    //     res.status(500).json({'msg':'Xóa commemnt thành công.'})
    // }).catch((err)=>{
    //     console.log(err);
    // })

});
module.exports = router;