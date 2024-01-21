const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

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




/**
 * @swagger
 *   tags:
 *      - name: admin-comments
 *        description: Quản lý đánh giá
 * /auth/comment/{id}:
 *   delete:
 *     summary: Xóa đánh giá bằng ID
 *     tags:
 *       - admin-comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của đánh giá cần xóa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đánh giá đã được xóa thành công
 *         content:
 *           application/json:
 *             example:
 *               msg: Xóa thành công đánh giá
 *       404:
 *         description: Không tìm thấy đánh giá với ID cung cấp
 *         content:
 *           application/json:
 *             example:
 *               msg: Lỗi khi xóa comment
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               msg: Lỗi server
 */
router.delete("/auth/comment/:id",async (req,res)=>{
    const id = req.params.id;
    try{
        const result = await Comment.findByIdAndDelete(id)
        if(!result){
            return res.status(404).json({
                msg: 'Lỗi khi xóa comment'
            })
        }
        res.status(200).json({
            msg: `Xóa thành công đánh giá ID: ${id}`
        })
    } catch(error){
        console.log(error);
        res.status(500).json({
            msg: 'Lỗi server'
        })
    }
});
module.exports = router;