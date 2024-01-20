const express = require('express');
const token = require('../middleware/token');
const router = express.Router();
const Location = require('../models/Location');
const Category = require('../models/Category');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Favorite = require('../models/Favourite')
const axios = require('axios');
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Favourite:
 *       type: object
 *       required:
 *       properties:
 *         _id:
 *           type: objectId
 *           description: Tự động tạo _id của favourite
 *         user_id:
 *           type: objectId
 *           description: Id người dùng
 *         location_id:
 *           type: ObjectId
 *           description: Id địa điểm
 */



//=======================================================================================
// Start Profile                                                              
//=======================================================================================
//lấy thông tin người dùng 
router.get("user/profile/:id",token,token.jwtValidate,async (req,res)=>{
    const id = req.params.id;
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
router.put("/user/update/password",token.jwtValidate,async (req,res)=>{
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

/**
 * @swagger
 * tags: 
 *  - name: user
 * /locations:
 *   get:
 *     summary: Lấy danh sách địa điểm
 *     description: API để lấy danh sách các địa điểm du lịch có trạng thái đang hoạt động.
 *     tags: 
 *      - user
 *     responses:
 *       200:
 *         description: Thành công. Trả về danh sách các địa điểm du lịch.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Danh sách địa điểm"
 *               locations:
 *                 - _id: "1"
 *                   name: "Địa điểm 1"
 *                   categories: 
 *                     _id: "category-id-1"
 *                     name: "Danh mục 1"
 *                   user_id: 
 *                     _id: "user-id-1"
 *                     name: "Người dùng 1"
 *                 - _id: "2"
 *                   name: "Địa điểm 2"
 *                   categories: 
 *                     _id: "category-id-2"
 *                     name: "Danh mục 2"
 *                   user_id: 
 *                     _id: "user-id-2"
 *                     name: "Người dùng 2"
 *       500:
 *         description: Lỗi - Không thể lấy danh sách địa điểm.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */

router.get("/locations", async (req, res) => {
    try {
        const locations = await Location.find({ status: true }).populate('categories').lean().exec();
        const locationsWithUsers = await Promise.all(locations.map(async (location) => {
            const userResponse = await axios.get(`http://localhost:4000/user/${location.user_id}`);
            const userInfo = userResponse.data.info;
            location.user_id = userInfo;
            return location;
        }));
        res.status(200).json({
            'msg': 'Danh sách địa điểm',
            'locations': locationsWithUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }
})

//liệt kê location theo id

/**
 * @swagger
 * tags: 
 *  - name: user
 * /location/{location_id}:
 *   get:
 *     summary: Lấy địa điểm theo location_id
 *     description: API để lấy địa điểm du lịch có trạng thái đang hoạt động.
 *     tags: 
 *      - user
 *     responses:
 *       200:
 *         description: Thành công. Trả về địa điểm du lịch.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Danh sách địa điểm"
 *               locations:
 *                 - _id: "1"
 *                   user_id: "659b55d35506896338af060f"
 *                   name: "Pizza Go Quy Nhơn"
 *                   desc: "⏰ 10:00-22:00"
 *                   address: "📍 Tầng 1 FLC Sea Tower Quy Nhơn"
 *       500:
 *         description: Lỗi - Không thể lấy danh sách địa điểm.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 *       404:
 *          description: Lỗi server
 */

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

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng
 *     description: API để lấy thông tin người dùng, các địa điểm của người dùng và các địa điểm ưa thích.
 *     tags:
 *      - user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của người dùng cần lấy thông tin.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin người dùng, các địa điểm của người dùng và các địa điểm ưa thích.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Thông tin người dùng"
 *               info:
 *                 _id: "user-id-1"
 *                 name: "Người dùng 1"
 *               locations:
 *                 - _id: "1"
 *                   name: "Địa điểm 1"
 *                   categories: 
 *                     _id: "category-id-1"
 *                     name: "Danh mục 1"
 *               favourite_locations:
 *                 - location_id: 
 *                     _id: "favourite-location-id-1"
 *                     name: "Địa điểm ưa thích 1"
 *       404:
 *         description: Lỗi - Không tìm thấy người dùng với ID cung cấp.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Không tìm thấy người dùng"
 *       500:
 *         description: Lỗi - Không thể lấy thông tin người dùng.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */

router.get("/user/:id", async (req, res) => {
    const user_id = req.params.id;
    //user location : gọi tới api location theo user id để lấy locations
    const locations = await axios.get(`http://localhost:4000/user/${user_id}/locations`)
    const user_locations = locations.data.locations;
    //user info
    const user_info = await User.findById(user_id);
    const favourites = await axios.get(`http://localhost:4000/user/${user_id}/favourite`)
    const user_favourite = favourites.data.location;
    res.status(200).json({
        msg: 'Thông tin người dùng',
        info: user_info,
        locations: user_locations,
        favourite_locations: user_favourite
    })
})


//liẹt kê Location theo id người dùng

/**
 * @swagger
 * /user/{id}/locations:
 *   get:
 *     summary: Lấy danh sách địa điểm của người dùng
 *     description: API để lấy danh sách các địa điểm du lịch của người dùng dựa trên ID.
 *     tags:
 *      - user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của người dùng cần lấy danh sách địa điểm.
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công. Trả về danh sách các địa điểm du lịch của người dùng.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Danh sách nơi du lịch của tôi"
 *               locations:
 *                 - _id: "1"
 *                   name: "Địa điểm 1"
 *                   categories: 
 *                     _id: "category-id-1"
 *                     name: "Danh mục 1"
 *                 - _id: "2"
 *                   name: "Địa điểm 2"
 *                   categories: 
 *                     _id: "category-id-2"
 *                     name: "Danh mục 2"
 *       400:
 *         description: Lỗi - Không tìm thấy người dùng với ID cung cấp.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Không tìm thấy ID này!"
 *       500:
 *         description: Lỗi - Không thể lấy danh sách địa điểm của người dùng.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */


router.get("/user/:id/locations",async (req,res)=>{ 
    const id = req.params.id;
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

/**
 * @swagger
 * /user/{id}/favourite:
 *   get:
 *     summary: Lấy danh sách địa điểm ưa thích của người dùng
 *     description: API để lấy danh sách các địa điểm du lịch ưa thích của người dùng dựa trên ID.
 *     tags: 
 *       - user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của người dùng cần lấy danh sách địa điểm ưa thích.
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công. Trả về danh sách các địa điểm du lịch ưa thích của người dùng.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Danh sách yêu thích của tôi:"
 *               locations:
 *                 - _id: "favourite-location-id-1"
 *                   name: "Địa điểm ưa thích 1"
 *                 - _id: "favourite-location-id-2"
 *                   name: "Địa điểm ưa thích 2"
 *       400:
 *         description: Lỗi - Không tìm thấy người dùng với ID cung cấp.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Không tìm thấy ID này!"
 *       500:
 *         description: Lỗi - Không thể lấy danh sách địa điểm ưa thích của người dùng.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */

router.get("/user/:id/favourite",async (req,res)=>{ 
    const id = req.params.id;
    await Favorite.find({user_id:id})
    .then((result)=>{
        console.log('=> User get my favourite location');
        console.log(result);
        res.status(200).json({'msg':'Danh sách yêu thích của tôi:','location':result})  
    }).catch(err=>{
        console.log(err);
        console.log('=> ID not exits');
        res.status(400).json({'msg':'không tìm thấy ID này!'})  
    })
})

// người dùng Upload location

/**
 * @swagger
 * /user/upload:
 *   post:
 *     summary: Tải lên nơi du lịch
 *     description: API để người dùng tải lên thông tin về một địa điểm du lịch mới.
 *     tags:
 *      - user  
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token để xác thực người dùng.
 *         schema:
 *           type: string
 *       - in: formData
 *         name: user_id
 *         required: true
 *         description: ID của người dùng tạo địa điểm du lịch.
 *         type: string
 *       - in: formData
 *         name: name
 *         required: true
 *         description: Tên địa điểm du lịch.
 *         type: string
 *       - in: formData
 *         name: desc
 *         required: true
 *         description: Mô tả về địa điểm du lịch.
 *         type: string
 *       - in: formData
 *         name: address
 *         required: true
 *         description: Địa chỉ của địa điểm du lịch.
 *         type: string
 *       - in: formData
 *         name: latitude
 *         required: true
 *         description: Vĩ độ của địa điểm du lịch.
 *         type: number
 *       - in: formData
 *         name: longitude
 *         required: true
 *         description: Kinh độ của địa điểm du lịch.
 *         type: number
 *       - in: formData
 *         name: categories
 *         required: true
 *         description: Danh mục của địa điểm du lịch (dạng chuỗi JSON).
 *         type: string
 *       - in: formData
 *         name: images
 *         required: true
 *         description: Hình ảnh địa điểm du lịch (dạng file).
 *         type: file
 *         format: binary
 *         isArray: true
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin về địa điểm du lịch mới.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Thêm nơi du lịch thành công"
 *               result:
 *                 _id: "1"
 *                 name: "Địa điểm 1"
 *                 desc: "Mô tả về Địa điểm 1"
 *       400:
 *         description: Lỗi - Không tìm thấy người dùng với ID cung cấp hoặc các thông tin không hợp lệ.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Không tìm thấy ID này!"
 *       500:
 *         description: Lỗi - Không thể lưu địa điểm du lịch.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */

router.post("/user/upload",token.jwtValidate,upload.array('images',6),async (req,res)=>{
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

/**
 * @swagger
 * /location:
 *   post:
 *     summary: Tìm kiếm địa điểm
 *     description: API để tìm kiếm địa điểm dựa trên từ khóa.
 *     tags: 
 *      - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: Từ khóa tìm kiếm địa điểm.
 *     responses:
 *       200:
 *         description: Thành công. Trả về danh sách địa điểm phù hợp với từ khóa.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Tìm location"
 *               locations:
 *                 - _id: "1"
 *                   name: "Địa điểm 1"
 *                   categories: 
 *                     _id: "category-id-1"
 *                     name: "Danh mục 1"
 *                   user_id: 
 *                     _id: "user-id-1"
 *                     name: "Người dùng 1"
 *                 - _id: "2"
 *                   name: "Địa điểm 2"
 *                   categories: 
 *                     _id: "category-id-2"
 *                     name: "Danh mục 2"
 *                   user_id: 
 *                     _id: "user-id-2"
 *                     name: "Người dùng 2"
 *       500:
 *         description: Lỗi - Không thể tìm kiếm địa điểm.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */

router.post("/location", async (req,res)=>{
    const key = req.body.key;
    try{
        const locations = await Location.find({ name: { $regex: key, $options: "i" } }).populate("categories").lean().exec();
        const locationsWithUsers = await Promise.all(locations.map(async (location) => {
            const userResponse = await axios.get(`http://localhost:4000/user/${location.user_id}`);
            const userInfo = userResponse.data.info;
            location.user_id = userInfo;
            return location;
        }));
        res.status(200).json({
            'msg': 'Danh sách địa điểm',
            'locations': locationsWithUsers
        });
    }catch (error){
        console.error(error);
        res.status(500).json({ 'error': 'Internal Server Error' });
    }

})


//Lấy danh sách comment theo location_id

/**
 * @swagger
 * /comments/{location_id}:
 *   get:
 *     summary: Lấy tất cả bình luận của một địa điểm
 *     description: API để lấy danh sách tất cả các bình luận của một địa điểm dựa trên ID địa điểm.
 *     tags: 
 *      - user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của địa điểm cần lấy bình luận.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công. Trả về danh sách tất cả các bình luận của địa điểm.
 *         content:
 *           application/json:
 *             example:
 *               comments:
 *                 - _id: "comment-id-1"
 *                   message: "Bình luận 1"
 *                   user_id: 
 *                     _id: "user-id-1"
 *                     name: "Người dùng 1"
 *                 - _id: "comment-id-2"
 *                   message: "Bình luận 2"
 *                   user_id: 
 *                     _id: "user-id-2"
 *                     name: "Người dùng 2"
 *       500:
 *         description: Lỗi - Không thể lấy danh sách bình luận.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */

router.get("/comments/:id", async (req, res) => { 
    // lấy tất cả bình luận của location_id
    const location_id = req.params.id;
    const comments = await Comment.find({ location_id: location_id}).lean().exec();

    //
    const commentsWithUsers = await Promise.all(comments.map(async (comment) => {
        const user = await axios.get(`http://localhost:4000/user/${comment.user_id}`);
        comment.user_id = user.data.info;
        return comment;
    }));
    res.status(200).json({'comments': commentsWithUsers});
})

//=======================================================================================
// End API Location For User                                                               
//=======================================================================================


//=======================================================================================
// Start API user comment , Favorite                                                              
//=======================================================================================
//người dùng dánh giá và comment

/**
 * @swagger
 * /user/comment:
 *   post:
 *     summary: Thêm hoặc cập nhật bình luận của người dùng
 *     description: API để người dùng thêm hoặc cập nhật bình luận của mình cho một địa điểm du lịch.
 *     tags: 
 *      - user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID của người dùng.
 *               location_id:
 *                 type: string
 *                 description: ID của địa điểm du lịch.
 *               message:
 *                 type: string
 *                 description: Nội dung bình luận.
 *               rating:
 *                 type: number
 *                 description: Đánh giá cho địa điểm (1-5).
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông báo về việc thêm hoặc cập nhật bình luận.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Sửa comment"
 *       500:
 *         description: Lỗi - Không thể thêm hoặc cập nhật bình luận.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */

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

/**
 * @swagger
 * /user/{user_id}/favorite/{location_id}:
 *   post:
 *     summary: Thêm hoặc xóa địa điểm khỏi danh sách yêu thích
 *     description: API để người dùng thêm hoặc xóa địa điểm khỏi danh sách yêu thích của mình.
 *     tags:
 *      - user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID của người dùng.
 *         schema:
 *           type: string
 *       - in: path
 *         name: location_id
 *         required: true
 *         description: ID của địa điểm du lịch.
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Thành công. Trả về thông báo về việc thêm hoặc xóa địa điểm khỏi danh sách yêu thích.
 *         content:
 *           application/json:
 *             example:
 *               status: "Đã thêm địa điểm vào danh sách yêu thích"
 *       500:
 *         description: Lỗi - Không thể thêm hoặc xóa địa điểm khỏi danh sách yêu thích.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */

router.post("/user/:user_id/favorite/:location_id",token.jwtValidate,async (req,res)=>{
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
