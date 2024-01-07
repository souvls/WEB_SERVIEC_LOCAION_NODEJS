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


//========= start Loaction ======================
router.post("/user/locations",token.jwtValidate,async (req,res)=>{
    const id = req.body.id;
    console.log(id);
    const Location = require('../models/Location');
    const Category = require('../models/Category');
    await Location.find({UserID:id}).populate("Category_id")
    .then((location)=>{
        console.log('=> find Location by ID');
        res.status(200).json({'msg':'Danh sách nơi du lịch của ID:','Location':location})  
    }).catch(err=>{
        console.log(err);
        console.log('=> ID not exits');
        res.status(400).json({'msg':'không tìm thấy ID này!'})  
    })
})

router.post("/user/upload",token.jwtValidate,upload.array('images',6),async (req,res)=>{
    const Location = require('../models/Location');
    const {UserID,Name,DESC,Address,Latitude,Longitude,Category_id } = req.body
    var imgs = [];
    for(var i = 0; i < req.files.length ; i++){
        imgs.push(req.files[i].filename);
    }
    //lưu nơi du lịch
    const newlocation = new Location({
        UserID:UserID,
        Name:Name,
        DESC:DESC,
        Address:Address,
        Latitude:Latitude,
        Longitude:Longitude,
        Status:false,
        Rating:0,
        Category_id:Category_id,
        ImgName:imgs
    })
    await newlocation.save().then(async location=>{
        console.log('=> user id:'+UserID+' insert new location');
        res.status(200).json({'msg':'thêm nơi du lich thành công','result':location})
    }).catch(err=>{
        console.log(err);
    })
})
//========= end Loaction ======================

//========= start coment ======================
router.post("/user/comment",token.jwtValidate,(req,res)=>{
    const Comemnt = require('../models/Comment');
    const {UserID,LocationID,Message} = req.body
    const NewComemnt = new Comemnt({
        UserID:UserID,
        LocationID:LocationID,
        Message:Message,
        Create_at:Date.now(),
        Status:true
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
    Location.find({ Name: { $regex: key, $options: "i" } }).populate("Category_id")
    .then((result)=>{
        console.log('=> Search location');
        res.status(200).json({'msg':'tìm location','location':result})
    })
})
module.exports = router;