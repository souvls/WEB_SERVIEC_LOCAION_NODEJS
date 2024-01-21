const express = require('express');
const router = express.Router();

// ==== START =====  call multer uplaod file
const multer = require('multer');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/avatar')// local save file
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+"jpg") //rename file
    }
})
const upload = multer({
    storage:storage
})

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *       properties:
 *         _id:
 *           type: objectId
 *           description: Tự động tạo _id của người dùng
 *         fullname:
 *           type: string
 *           description: Họ và tên người dùng
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           description: Mật khẩu 
 *         avatar:
 *           type: string
 *           description: Ảnh đại diện của người dùng
 *         role:
 *           type: boolean
 *           description: Vai trò của người dùng ['user', 'admin']
 */




/**
 * @swagger
 * tags: 
 *  - name: admin-users
 *    description: Quản lý người dùng
  * /auth/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng.
 *     description: API cho admin để lấy danh sách tất cả người dùng.
 *     tags:
 *         - admin-users
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Mã accessToken (Bearer Token)
 *         required: true
 *         schema:
 *           type: string
 *           format: Bearer <accessToken>
 *     responses:
 *       200:
 *         description: Danh sách người dùng.
 *         content:
 *           application/json:
 *             example:
 *               msg: 'tất cả User'
 *               users: []
 *       500:
 *         description: Lỗi server hoặc không có người dùng trong database.
 *         content:
 *           application/json:
 *             example:
 *               msg: 'Chưa có người dùng trong database'
 */


router.get("/auth/users",async (req,res)=>{
    const User = require('../models/User');
    try{
        await User.find().then(async (User)=>{
            console.log('=> admin get all user');
            res.status(200).json({msg:'tất cả User',users:User});
        }).catch(() =>{
            console.log("find all User not exit");
            res.status(500).json({'msg':'Chưa có người dùng trong database'})
        });
    }catch (error){
        console.log(error+",get all user");
    }
})



/**
 * @swagger
 * /auth/user/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng bằng ID
 *     description: API để lấy thông tin của người dùng dựa trên ID người dùng.
 *     tags:
 *      - admin-users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của người dùng cần lấy thông tin.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin người dùng theo ID.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Tìm người dùng bằng ID"
 *               user:
 *                 _id: "user-id-1"
 *                 name: "Người dùng 1"
 *       500:
 *         description: Lỗi - Không thể lấy thông tin người dùng.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */


router.get("/auth/user/:id",async (req,res)=>{
    const User = require('../models/User');
    const id = req.params.id
    try{
        await User.findById(id).then(User=>{
            console.log('=> admin find user by id');
            res.status(200).json({msg:'tìm người dùng bằng ID',user:User});
        }).catch(() =>{
            console.log('=> admin find user by id, No exit');
            res.status(500).json({'msg':'Không tìm thấy mã ID của người dùng này.'})
        });
    }catch (error){
        console.log(error+",find user by id");
    }
})


/**
 * @swagger
 * /auth/user/email:
 *   get:
 *     summary: Tìm người dùng bằng Email
 *     description: API để tìm người dùng dựa trên địa chỉ email.
 *     tags: 
 *      - admin-users
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         description: Địa chỉ email của người dùng cần tìm.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin người dùng theo email.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Tìm người dùng bằng Email"
 *               user:
 *                 _id: "user-id-1"
 *                 name: "Người dùng 1"
 *                 email: "user1@example.com"
 *       500:
 *         description: Lỗi - Không tìm thấy người dùng với địa chỉ email đã cho.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */


router.get("/auth/user/email",async (req,res)=>{
    const User = require('../models/User');
    const email = req.body.email
    try{
        await User.findOne({'email':email}).then(User=>{
            if(User){
                console.log('=> admin find user by email');
                res.status(200).json({msg:'tìm người dùng bằng Email',user:User});
            }else{
                console.log('=> admin find user by email, do not exist');
                res.status(500).json({'msg':'Không tìm thấy Email của người dùng này.'})
            } 
        })
    }catch (error){
        console.log(error+",find user by email");
    }
})

/**
 * @swagger
 * /auth/user/{user_id}:
 *   delete:
 *     summary: Xóa người dùng
 *     description: API để xóa người dùng dựa trên ID.
 *     tags: 
 *      - admin-users
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID của người dùng cần xóa.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công. Người dùng đã được xóa.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Đã xóa người dùng ID: user-id-1"
 *       500:
 *         description: Lỗi - Không tìm thấy người dùng với ID đã cho.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */




router.delete("/auth/user/:user_id",async (req,res)=>{
    const User = require('../models/User');
    const Authentication = require('../models/Authentication');
    const id = req.params.user_id;
    try{
        await User.findByIdAndDelete(id).then(async User=>{
            if(User){
                await Authentication.findOneAndDelete({'UserID':id}).then(()=>{
                    console.log('=> admin delete user by id');
                    res.status(200).json({msg:'đã xóa người dùng ID: '+id});
                })
            }else{
                console.log('=> admin delete user, do not exist');
                res.status(500).json({'msg':'Không tìm thấy ID của người dùng này.'})
            } 
        })
    }catch (error){
        console.log(error+",find delete user by ID");
    }
})
module.exports = router;