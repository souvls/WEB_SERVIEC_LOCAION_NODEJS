const express = require('express');
const token = require('../middleware/token');
const router = express.Router();
const Location = require('../models/Location');
const Category = require('../models/Category');
const User = require('../models/User');
const Comment = require('../models/Comment');
// ==== START =====  call multer uplaod file
const multer = require('multer');
const { populate } = require('dotenv');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/locations')// local save file
    },
    filename:function(req,file,cb){
        const ext = file.originalname.split(".")[1];
        cb(null, Date.now() + "." + ext); //rename file
    }
})
const upload = multer({storage});

//Hàm shuffle xáo trộn mảng
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

//=======================================================================================
// Start API Category For User                                                               
//=======================================================================================

router.get("/categories",async (req,res)=>{//Liêt ke danh sách địa điểm du lịch
    const Category = require('../models/Category');
    
    await Category.find().then((result)=>{
        console.log('=> get all category');
        res.status(200).json({'msg':'Danh sách loại hình du lịch','categories':result})
    })
})
//=======================================================================================
// End API Category For User                                                               
//=======================================================================================



//=======================================================================================
// Start API Location For User                                                               
//=======================================================================================

//Hàm cập nhật rating cho Location khi User comment rating
async function updateRatingLocation(location_id){
    const comments = await Comment.find({location_id: location_id});
    const totalRating = comments.reduce((total, comment) => total + comment.rating, 0);
    const avgRating = totalRating / comments.length;
    await Location.findByIdAndUpdate(location_id, { rating: avgRating });
}


//Liệt kê location
router.get("/locations", async (req, res) => {
    await Location.find().populate('categories').then((result) => {
        console.log('=> get all location');
        shuffleArray(result);
        res.status(200).json({
            'msg': 'Danh sách địa điểm',
            'locations': result
        })
    })
})

//liệt kê location theo id
router.get("/location/:location_id", async (req, res) => { 
    const location_id = req.params.location_id;
    await Location.findById(location_id).populate("categories").then((location) => {
        if (location) {
            res.status(200).json(location);
        } else {
            res.status(404).json({
                'msg': 'Không tìm thấy!'
            });
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            'msg': 'Lỗi server!'
        });
    });
})

//liẹt kê Location theo id người dùng
router.get("/user/:id/location",token.jwtValidate,async (req,res)=>{ 
    const id = req.params.id;
    const Location = require('../models/Location');
    const Category = require('../models/Category');
    await Location.find({user_id:id}).populate("categories")
    .then((location)=>{
        console.log('=> find Location by ID');
        res.status(200).json({msg:'anh sách nơi du lịch của tôi',location:location})  
    }).catch(err=>{
        console.log(err);
        console.log('=> ID not exits');
        res.status(400).json({'msg':'không tìm thấy ID này!'})  
    })
})

//liệt kê Location theo User ID yêu thích
router.get("/user/:id/favourite",token.jwtValidate,async (req,res)=>{ 
    const id = req.params.id;
    const Favorite = require('../models/Favourite')
    // const Location = require('../models/Location');
    // const Category = require('../models/Category');
    await Favorite.find({user_id:id})
    .then((result)=>{
        console.log('=> User get my favourit location');
        console.log(result);
        res.status(200).json({'msg':'Danh sách yêu thích của tôi:','location':result})  
    }).catch(err=>{
        console.log(err);
        console.log('=> ID not exits');
        res.status(400).json({'msg':'không tìm thấy ID này!'})  
    })
})

// người dùng Upload location
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

//Tìm kiếm location
router.post("/location",(req,res)=>{
    const Location = require('../models/Location');
    const Category = require('../models/Category');
    const key = req.body.key;
    console.log(req.body.key);
    Location.find({ name: { $regex: key, $options: "i" } }).populate("categories")
    .then(async (result)=>{
        for (const location of result ){
            const user = await User.findById(location.user_id).exec();
            location.user_id = user;
        }
        console.log('=> Search location');
        res.status(200).json({'msg':'tìm location','locations':result})
    })
})


//Lấy danh sách comment theo location_id
router.get("/comments/:location/:id", async (req, res) => { 
    const Comment = require('../models/Comment');
    const User = require('../models/User');
    const location_id = req.params.location_id;
    Comment.find({ 'location_id': location_id }).then(async (result) => {
        for ( const comment of result ){
            const user = await User.findById(comment.user_id).exec();
            comment.user_id = user;
        }
        res.status(200).json({'comments': result});
    })
})

//=======================================================================================
// End API Location For User                                                               
//=======================================================================================


//=======================================================================================
// Start API user comment , Favorite                                                              
//=======================================================================================
//người dùng dánh giá và comment
router.post("/user/comment",token.jwtValidate,async (req,res)=>{
    const Comment = require('../models/Comment');
    const {user_id, location_id, message, rating} = req.body

    await Comment.findOne({user_id:user_id, location_id:location_id}) //tìm User này Commet trong Location này chưa
        .then((result)=>{
            if(result){ // nếu comment rồi thì cập nhật comment
                Comment.findByIdAndUpdate(result._id,{message:message,rating:rating})
                    .then(()=>{
                        updateRatingLocation(location_id);
                        console.log('=> user update comment');
                        res.status(200).json({'msg':'sửa comment'})
                    })
            }else{ // chưa comment thì tạo mới
                const NewComment = new Comment({
                    user_id:user_id,
                    location_id:location_id,
                    message:message,
                    rating: rating,
                    liked:0,
                    created_at: Date.now(),
                    status: true
                })
                NewComment.save().then(()=>{
                    updateRatingLocation(location_id);
                    console.log('=> user create new comment');
                    res.status(200).json({'msg':'comment'})
                })
            }
        })      
})

//favorite , unfavorite
router.get("/user/:id/favorite/:location",token.jwtValidate,async (req,res)=>{
    const Favorite = require('../models/Favourite')
    const user_id = req.params.id;
    const location_id = req.params.location;

    if(user_id !== null && location_id !== null){
        //kiểm tra người dùng này đã thích location này chưa
        await Favorite.findOne({user_id:user_id,location_id:location_id})
        .then(result =>{
            if(result){ // nếu đã thích rồi thì xóa (unfavorit)
                Favorite.findByIdAndDelete(result._id)
                    .then(()=>{
                    res.status(201).json({status:"ok"})
                    })
            }else{ // nếu chưa thì tạo mới (add favourite)
                const newFavorite = new Favorite({
                    user_id:user_id,
                    location_id:location_id
                })
                newFavorite.save()
                    .then(()=>{
                    res.status(201).json({status:"ok"})
                    })
            }  
        })
        .catch(err => console.log(err))
    }
})
//=======================================================================================
// End API user comment , Favorite                                                              
//=======================================================================================
module.exports = router;