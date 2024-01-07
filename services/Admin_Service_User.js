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


router.get("/auth/user/all",async (req,res)=>{
    const User = require('../models/User');
    try{
        await User.find().then(async (User)=>{
            // var data = [];
            // for (const item of User){
            //     const file = fs.readFileSync(`./imgUpload/avatar/${item.Avatar}`);
            //     data.push({
            //         '_id':item._id,
            //         'Fullname':item.Fullname,
            //         'Email':item.Email,
            //         'Avatar':item.Avatar,
            //         'Role':item.Role,
            //         'File':file
            //     })
            // }
            console.log('=> admin get all user');
            res.status(200).json({msg:'tất cả User',user:User});
        }).catch(() =>{
            console.log("find all User not exit");
            res.status(500).json({'msg':'Chưa có người dùng trong database'})
        });
    }catch (error){
        console.log(error+",get all user");
    }
})

router.post("/auth/user/id",async (req,res)=>{
    const User = require('../models/User');
    const id = req.body.id
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

router.post("/auth/user/email",async (req,res)=>{
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

router.delete("/auth/user",async (req,res)=>{
    const User = require('../models/User');
    const Authentication = require('../models/Authentication');
    const id = req.body.id
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