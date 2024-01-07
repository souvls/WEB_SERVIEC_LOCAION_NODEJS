const express = require('express');
const token = require('../middleware/token');
const router = express.Router();

// ==== START =====  call multer uplaod file
const multer = require('multer');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/location')// local save file
    },
    filename:function(req,file,cb){
        const ext = file.originalname.split(".")[1];
        cb(null, Date.now() + "." + ext); //rename file
    }
})
const upload = multer({storage});

// ================ start category ====================
//Liêt ke danh sách địa điểm du lịch
router.get("/categories",async (req,res)=>{
    const Category = require('../models/Category');
    await Category.find().then((result)=>{
        console.log('=> get all category');
        res.status(200).json({'msg':'Danh sách loại hình du lịch','categories':result})
    })
})
// ================ end category ====================


//========= start Location ======================
router.post("/user/locations",token.jwtValidate,async (req,res)=>{
    const id = req.body.id;
    console.log(id);
    const Location = require('../models/Location');
    const Category = require('../models/Category');
    await Location.find({user_id:id}).populate("category_id")
    .then((location)=>{
        console.log('=> find Location by ID');
        res.status(200).json({'msg':'Danh sách nơi du lịch của ID:','location':location})  
    }).catch(err=>{
        console.log(err);
        console.log('=> ID not exits');
        res.status(400).json({'msg':'không tìm thấy ID này!'})  
    })
})

router.post("/user/upload",token.jwtValidate,upload.array('images',6),async (req,res)=>{
    const Location = require('../models/Location');
    const {user_id,name,desc,address,latitude,longitude,categories } = req.body
    var imgs = [];
    for(var i = 0; i < req.files.length ; i++){
        imgs.push(req.files[i].filename);
    }

     // Chuyển đổi trường categories từ chuỗi JSON thành mảng
    const parsedCategories = JSON.parse(categories);

    //lưu nơi du lịch
    const newlocation = new Location({
        user_id:user_id,
        name:name,
        desc:desc,
        address:address,
        latitude:latitude,
        longitude:longitude,
        status:false,
        rating:0,
        categories: parsedCategories,
        img_name:imgs
    })
    await newlocation.save().then(async location=>{
        console.log('=> user id:'+user_id+' insert new location');
        res.status(200).json({'msg':'thêm nơi du lich thành công','result':location})
    }).catch(err=>{
        console.log(err);
    })
})
//========= end Loaction ======================

//========= start comment ======================
router.post("/user/comment",token.jwtValidate,(req,res)=>{
    const Comemnt = require('../models/Comment');
    const {user_id,location_id,message} = req.body
    const NewComemnt = new Comemnt({
        user_id:user_id,
        location_id:location_id,
        message:message,
        create_at:Date.now(),
        status:true
    })
    NewComemnt.save().then(()=>{
        console.log('=> user create new comment');
        res.status(200).json({'msg':'comment'})
    })
})

router.post("/location",(req,res)=>{
    const Location = require('../models/Location');
    const Category = require('../models/Category');
    const key = req.body.key;
    Location.find({ name: { $regex: key, $options: "i" } }).populate("category_id")
    .then((result)=>{
        console.log('=> Search location');
        res.status(200).json({'msg':'tìm location','location':result})
    })
})
module.exports = router;