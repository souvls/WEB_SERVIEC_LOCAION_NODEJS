const express = require('express');
const router = express.Router();
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const Location = require('../models/Location')
/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: objectId
 *           description: Tự động tạo _id của địa điểm
 *         name:
 *           type: string
 *           description: Tên loại hình du lịch
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *       properties:
 *         _id:
 *           type: objectId
 *           description: Tự động tạo _id của địa điểm
 *         name:
 *           type: string
 *           description: Tên địa điểm
 *         desc:
 *           type: string
 *           description: Mô tả địa điểm
 *         address:
 *           type: string
 *           description: Địa chỉ của địa điểm
 *         latitude:
 *           type: number
 *           description: Vĩ độ
 *         longitude:
 *           type: number
 *           description: Kinh độ
 *         rating: 
 *           type: number
 *           description: Đánh giá
 *         category_id: 
 *           type: objectId
 *           description: Loại du lịch
 *         img_name:
 *           type: array
 */



//=======================================================================================
// Start API Category For Admin                                                               
//=======================================================================================
router.get("/auth/categories",async (req,res)=>{ //Liêt kê danh sách địa điểm du lịch
    const Category = require('../models/Category');
    await Category.find().then((result)=>{
        console.log('=> admin get all categories');
        res.status(200).json({'msg':'Danh sách loại hình du lịch','categories':result})
    })
})

router.post("/auth/category",async (req,res)=>{ //thêm loại địa điểm du lịch mới
    const Category = require('../models/Category');
    const Name = req.body.name;

    await Category.findOne({name:Name}).then(async (result)=>{
        if(!result){
            NewCategory = new Category({
                name:Name
            })
            await NewCategory.save().then((result)=>{
                console.log('=> admin insert new category');
                res.status(200).json({'msg':'Thêm loại hình du lịch thành công','category':result})
            })
        }else{
            console.log('=> admin, this name category is exist');
            res.status(400).json({'msg':'loại hình du lịch này đã tồn tại'})
        }
    }).catch((err)=>{
        console.log(err+",findOne Category");
    })
})

router.delete("/auth/category/:category_id",async (req,res)=>{ //xóa loại địa điểm du lịch
    const Category = require('../models/Category');
    const id = req.params.category_id;
    await Category.findByIdAndDelete(id)
    .then((result)=>{
        console.log('=> admin, delete category id:'+id);
        res.status(200).json({'msg':'đã xóa loại hình du lịch, id: '+id })
    }).catch(err=>{
        res.status(400).json({'msg':'Không tìn thấy, id: '+id })
    })
})
//=======================================================================================
// End API Category For Admin                                                              
//=======================================================================================


//=======================================================================================
// Start API Location For Admin                                                              
//=======================================================================================

//duyệt 
router.put("/auth/allow/location/:location_id",async (req,res)=>{
    const id = req.params.location_id;
    const Location = require('../models/Location');

    try {
        const location = await Location.findById(id);
        if (!location) {
        return res.status(404).json({ 'msg': 'Không tìm thấy địa điểm' });
        }
        location.status = !location.status;
        await location.save();
        return res.status(200).json({ 'msg': 'Cập nhật status thành công' });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ 'msg': 'Không thể cập nhật status' });
    }
})
//lấy danh sách điểm du lịch
router.get("/auth/locations",async (req,res)=>{ //lấy danh sách điểm du lịch
    const Location = require('../models/Location');
    const Category = require('../models/Category');
    const id = req.body.id;
    await Location.find(id).populate("categories")
    .then(async (result)=>{
        for (const location of result ){
            const user = await User.findById(location.user_id).exec();
            location.user_id = user;
        }
        console.log('=> find Location by ID');
        res.status(200).json({'msg':'Danh sách nơi du lịch','locations':result})  
    }).catch(err=>{
        console.log(err);
    })
})

router.get("/auth/location/:id",async (req,res)=>{ //Tìm điểm du lịch theo ID
    const Location = require('../models/Location');
    const Category = require('../models/Category');
    const id = req.params.id;
    await Location.findById(id).populate("Category_id")
    .then((location)=>{
        console.log('=> find Location by ID');
        res.status(200).json({'msg':'Tìm Location bằng ID','Location':location})  
    }).catch(err=>{
        console.log(err);
    })
})

router.delete("/auth/location/:location_id",async (req,res)=>{ //Xóa địa điểm du lịch
    try {
        const id = req.params.location_id;
        const location = await Location.findByIdAndDelete({ _id: id });
        if (!location) {
            return res.status(404).json({ 'msg': 'Không tìm thấy địa điểm du lịch với ID: ' + id });
        }
        const fileName = location.img_name;
        for (const img of fileName) {
            const filePath = path.join(__dirname, '..', `uploads/locations/${img}`);
            // const filePath = (`../uploads/locations/${img}`);
            console.log(filePath);
            try {
                await fs.promises.unlink(filePath);
            } catch (err) {
                console.error('Lỗi khi xóa file:', err);
            }
        }
        console.log('=> Xóa địa điểm du lịch bởi ID');
        res.status(200).json({ 'msg': 'Xóa thành công địa điểm du lịch với ID: ' + id });
    } catch (error) {
        console.error('Lỗi khi xóa địa điểm du lịch:', error);
        res.status(500).json({ 'msg': 'Lỗi server khi xóa địa điểm du lịch' });
    }
})

/*router.patch("/auth/location/status", async (req, res) => {
    const Location = require('../models/Location');
    const id = req.body.id;
    await Location.findById({ _id: id })
        .then(async (x) => {
            y = !x.Status
            await Location.updateOne({_id:id},{Status:y})
            console.log('=> Update Location by ID');
            res.status(200).json({ 'msg': 'cật nhật status location ID:' + id+'/'+x.Status+' ==> '+y})
        }).catch(err => {
            console.log(err);
        })
})*/
//=======================================================================================
// Start API Location For Admin                                                              
//=======================================================================================

module.exports = router;