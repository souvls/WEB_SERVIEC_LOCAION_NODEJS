const express = require('express');
const token = require('../middleware/token');
const router = express.Router();
const Location = require('../models/Location');
const Category = require('../models/Category');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Favorite = require('../models/Favourite')

// ==== START =====  call multer uplaod file
const multer = require('multer');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        const dir = file.fieldname === 'images' ? 'locations' : 'avatar';
        cb(null,'uploads/'+dir)// local save file
    },
    filename:function(req,file,cb){
        const ext = file.originalname.split(".")[1];
        cb(null, Date.now() + "." + ext); //rename file
    }
})
const upload = multer({storage});
//=====================================================================

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
// Start Profile                                                              
//=======================================================================================
//lấy thông tin người dùng 
router.get("user/profile/:id",token,token.jwtValidate,async (req,res)=>{
    const id = req.params.id;
    const User = require('../models/User');
    await User.findById(id).then(User=>{
        res.status(200).json({msg:'thông tin người dùng',user:User});
    }).catch(() =>{
        res.status(500).json({'msg':'Không tìm thấy mã ID của người dùng này.'})
    });  
})
//Đổi fullname
router.put("/user/update/fullname",token.jwtValidate,async (req,res)=>{
    const {id,fullname} = req.body;
    const User = require('../models/User')  
    await User.findByIdAndUpdate(id,{fullname:fullname}).then(()=>{
        res.status(200).json({'msg':'đổi họ tên',})
    }).catch(err =>console.log(err))
})
//Đổi Mật khẩu
router.put("/user/update/pasword",token.jwtValidate,async (req,res)=>{
    const {id,oldPassword,newPassword} = req.body;
    const User = require('../models/User');
    const Encypt = require('../middleware/encrypt');
    
    //tìm người dùng
    await User.findById(id).then(async (result)=>{
        //kiểm tra mật khẩu cũ
        const checkPass = await Encypt.check(oldPassword,result.password)
        if(checkPass){ // đổi mật khẩu
            const newPassHashed = await Encypt.hash(newPassword)
            User.findByIdAndUpdate(result._id,{password:newPassHashed}).then(()=>{
                res.status(200).json({'msg':'đổi mật khẩu',})
            })
        }else{
            res.status(400).json({'msg':'mật khẩu không đúng',})
        }
    }).catch(err =>console.log(err));
}) 
//đổi avatar       
router.put("/user/update/avatar" ,token.jwtValidate,upload.single("avatar"), (req,res)=>{
    const User = require('../models/User');
    const id = req.body.id;
    const avatar = req.file.filename
    User.findByIdAndUpdate(id,{avatar:avatar}).then(result =>{
        if(result){
            //Xóa Avatar cũ
            if(result.avatar !== 'no_avatar.png'){
                const fs = require('fs');
                const filePath = 'uploads/avatar/'+result.avatar;
                fs.unlink(filePath, (err) => {
                    if (err) {
                      console.error('Error deleting file:', err);
                    } else {
                      console.log('File deleted successfully!');
                    }
                  });
            }
            res.status(200).json({msg: 'Cập nhật thành công'})
        }else{
            res.status(400).json({msg: 'Không Cập nhật'})
        }
    }).catch(err=>{
        console.log(err)
        res.status(400).json({msg: 'Không tìm thấy người dùng ID này',})
    })
})
//=======================================================================================
// End Profile                                                              
//=======================================================================================

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
    await Location.find({status: true}).populate('categories').then(async (result) => {
        console.log('=> get all location');
        shuffleArray(result);
        for (const location of result){
            const user = await User.findById(location.user_id).exec();
            location.user_id = user;
        }
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
//Liệt kê thông tin người dùng  (userInfo, favouriteList, userLocation)
router.get("/user/:id", async (req, res) => {
    const user_id = req.params.id;
    //user location
    const user_locations = await Location.find({user_id: user_id}).populate("categories");
    //user info
    const user_info = await User.findById(user_id);
    const user_favourite = await Favorite.find({ user_id: user_id})
    for (const favourite of user_favourite ){
        const location = await Location.findById(favourite.location_id).exec();
        if (location) {
            favourite.location_id = location;
        }
    };
    res.status(200).json({
        msg: 'Thông tin người dùng',
        info: user_info,
        locations: user_locations,
        favourite_locations: user_favourite
    })
})
//liẹt kê Location theo id người dùng
router.get("/user/:id/locations",token.jwtValidate,async (req,res)=>{ 
    const id = req.params.id;
    const Location = require('../models/Location');
    const Category = require('../models/Category');
    await Location.find({user_id:id}).populate("categories")
    .then((location)=>{
        console.log('=> find Location by ID');
        res.status(200).json({msg:'Danh sách nơi du lịch của tôi',locations:location})  
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
router.get("/comments/:id", async (req, res) => { 
    const Comment = require('../models/Comment');
    const User = require('../models/User');
    const location_id = req.params.id;
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
router.post("/user/:user_id/favorite/:location_id",token.jwtValidate,async (req,res)=>{
    const Favorite = require('../models/Favourite')
    const user_id = req.params.user_id;
    const location_id = req.params.location_id;

    if(user_id !== null && location_id !== null){
        //kiểm tra người dùng này đã thích location này chưa
        await Favorite.findOne({user_id:user_id, location_id:location_id})
        .then(result =>{
            if(result){ // nếu đã thích rồi thì xóa (unfavorite)
                Favorite.findByIdAndDelete(result._id)
                    .then(()=>{
                    res.status(201).json({status:"Đã xóa địa điểm khỏi danh sách yêu thích"})
                    })
            }else{ // nếu chưa thì tạo mới (add favourite)
                const newFavorite = new Favorite({
                    user_id:user_id,
                    location_id:location_id
                })
                newFavorite.save()
                    .then(()=>{
                    res.status(201).json({status:"Đã thêm địa điểm vào danh sách yêu thích"})
                    })
            }  
        })
        .catch(err => console.log(err))
    }
})

//get favorite list by user id

//=======================================================================================
// End API user comment , Favorite                                                              
//=======================================================================================
module.exports = router;
