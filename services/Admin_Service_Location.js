const express = require('express');
const router = express.Router();

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

/**
 * @swagger
 * components:
 *   schemas:
 *     Img_location:
 *       type: object
 *       required:
 *       properties:
 *         _id:
 *           type: objectId
 *           description: Tự động tạo _id hình ảnh địa điểm
 *         location_id:
 *           type: objectId
 *         name:
 *           type: string
 */


// ============== start Category ======================
//Liêt kê danh sách địa điểm du lịch
router.get("/auth/categories",async (req,res)=>{
    const Category = require('../models/Category');
    await Category.find().then((result)=>{
        console.log('=> admin get all category');
        res.status(200).json({'msg':'Danh sách loại hình du lịch','categories':result})
    })
})


//thêm loại địa điểm du lịch mới

router.post("/auth/category",async (req,res)=>{
    const Category = require('../models/Category');
    const Name = req.body.name

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

//xóa loại địa điểm du lịch

router.delete("/auth/category/:id",async (req,res)=>{
    const Category = require('../models/Category');
    const id = req.params.id;
    await Category.findByIdAndDelete(id)
    .then((result)=>{
        console.log('=> admin, delete category id:'+id);
        res.status(200).json({'msg':'đã xóa loại hình du lịch, id: '+id })
    }).catch(err=>{
        res.status(400).json({'msg':'Không tìn thấy, id: '+id })
    })
})
// ============== End Category ======================

// ============== Start Location ======================

//all
router.get("/auth/locations",async (req,res)=>{
    const Location = require('../models/Location');
    const Category = require('../models/Category');
    const id = req.body.id;
    await Location.find(id).populate("Category_id")
    .then((location)=>{
        console.log('=> find Location by ID');
        res.status(200).json({'msg':'Danh sách nơi du lịch','Location':location})  
    }).catch(err=>{
        console.log(err);
    })
})

//find by id
router.get("/auth/location/:id",async (req,res)=>{
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
router.delete("auth/location/:id",async (req,res)=>{
    const Location = require('../models/Location');
    const id = req.params.id
    await Location.findByIdAndDelete({ _id: id }).then(()=>{
        console.log('=> Delete Location by ID');
        res.status(200).json({ 'msg': 'xóa location ID:' + id})
    })
})
// router.patch("/auth/location/status", async (req, res) => {
//     const Location = require('../models/Location');
//     const id = req.body.id;
//     await Location.findById({ _id: id })
//         .then(async (x) => {
//             y = !x.Status
//             await Location.updateOne({_id:id},{Status:y})
//             console.log('=> Update Location by ID');
//             res.status(200).json({ 'msg': 'cật nhật status location ID:' + id+'/'+x.Status+' ==> '+y})
//         }).catch(err => {
//             console.log(err);
//         })
// })


module.exports = router;