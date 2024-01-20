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
/**
 * @swagger
 * tags:
 *   - name: admin-categories
 *     description: Quản lý danh mục địa điểm
 *
 * /auth/categories:
 *   get:
 *     summary: Lấy danh sách loại hình du lịch
 *     description: API để lấy danh sách các loại hình du lịch từ server.
 *     tags:
 *       - admin-categories
 *     responses:
 *       200:
 *         description: Thành công. Trả về danh sách các loại hình du lịch.
 *         content:
 *           application/json:
 *             example:
 *               customMessage: "Danh sách loại hình du lịch"
 *               categories:
 *                 - _id: "1"
 *                   name: "Du lịch biển"
 *                 - _id: "2"
 *                   name: "Du lịch núi"
 */
router.get("/auth/categories",async (req,res)=>{ //Liêt kê danh sách địa điểm du lịch
    const Category = require('../models/Category');
    await Category.find().then((result)=>{
        console.log('=> admin get all categories');
        res.status(200).json({'msg':'Danh sách loại hình du lịch','categories':result})
    })
})


/**
 * @swagger
 * /auth/category:

 *   post:
 *     summary: Thêm loại địa điểm du lịch mới
 *     description: API để thêm một loại hình du lịch mới vào hệ thống.
 *     tags: 
 *      - admin-categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên của loại hình du lịch mới.
 *     responses:
 *       200:
 *         description: Thêm loại hình du lịch thành công.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Thêm loại hình du lịch thành công"
 *               category:
 *                 _id: "1"
 *                 name: "Du lịch biển"
 *       400:
 *         description: Lỗi - loại hình du lịch đã tồn tại.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Loại hình du lịch này đã tồn tại"
 */

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



/**
 * @swagger
 * /auth/category/{category_id}:
 *   delete:
 *     summary: Xóa loại địa điểm du lịch
 *     description: API để xóa một loại hình du lịch dựa trên ID.
 *     tags:
 *      - admin-categories
 *     parameters:
 *       - in: path
 *         name: category_id
 *         required: true
 *         description: ID của loại hình du lịch cần xóa.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa loại hình du lịch thành công.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Đã xóa loại hình du lịch, id: 123"
 *       400:
 *         description: Lỗi - Không tìm thấy loại hình du lịch với ID cung cấp.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Không tìn thấy, id: 123"
 */
router.delete("/auth/category/:category_id",async (req,res)=>{ //xóa loại địa điểm du lịch
    const Category = require('../models/Category');
    const id = req.params.category_id;
    await Category.findByIdAndDelete(id)
    .then((result)=>{
        console.log('=> admin, delete category id:'+id);
        res.status(200).json({'msg':'đã xóa loại hình du lịch, id: '+id })
    }).catch(err=>{
        res.status(400).json({'msg':'Không tìm thấy, id: '+id })
    })
})
//=======================================================================================
// End API Category For Admin                                                              
//=======================================================================================


//=======================================================================================
// Start API Location For Admin                                                              
//=======================================================================================


//duyệt


/**
 * @swagger
 * /auth/allow/location/{location_id}:
 *   put:
 *     summary: Cập nhật trạng thái địa điểm du lịch
 *     description: API để cập nhật trạng thái của một địa điểm du lịch dựa trên ID.
 *     tags:
 *      - admin-locations
 *     parameters:
 *       - in: path
 *         name: location_id
 *         required: true
 *         description: ID của địa điểm du lịch cần cập nhật trạng thái.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Cập nhật status thành công"
 *       400:
 *         description: Lỗi - Không tìm thấy địa điểm du lịch với ID cung cấp hoặc không thể cập nhật trạng thái.
 *         content:
 *           application/json:
 *             example:
 *               msg: 'Không tìm thấy địa điểm'
 */


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



/**
 * @swagger
 * tags: 
 *  - name: admin-locations
 *    description: Quản lý địa điểm
 * /auth/locations:
 *   get:
 *     summary: Lấy danh sách điểm du lịch
 *     description: API để lấy danh sách các điểm du lịch từ server.
 *     tags: 
 *        - admin-locations
 *     responses:
 *       200:
 *         description: Thành công. Trả về danh sách các điểm du lịch.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Danh sách nơi du lịch"
 *               locations:
 *                 - _id: "1"
 *                   name: "Địa điểm 1"
 *                   user_id: 
 *                     _id: "user-id-1"
 *                     name: "Người dùng 1"
 *                 - _id: "2"
 *                   name: "Địa điểm 2"
 *                   user_id: 
 *                     _id: "user-id-2"
 *                     name: "Người dùng 2"
 *       500:
 *         description: Lỗi - Không thể lấy danh sách điểm du lịch.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */

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

/**
 * @swagger
 * /auth/location/{id}:
 *   get:
 *     summary: Tìm điểm du lịch theo ID
 *     description: API để tìm một điểm du lịch dựa trên ID.
 *     tags: 
 *       - admin-locations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID của điểm du lịch cần tìm.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công. Trả về thông tin của điểm du lịch.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Tìm Location bằng ID"
 *               Location:
 *                 _id: "1"
 *                 name: "Địa điểm 1"
 *                 category_id: 
 *                   _id: "category-id-1"
 *                   name: "Danh mục 1"
 *       404:
 *         description: Lỗi - Không tìm thấy điểm du lịch với ID cung cấp.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Không tìm thấy Location"
 *       500:
 *         description: Lỗi - Không thể tìm điểm du lịch.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal Server Error"
 */


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


/**
 * @swagger
 * /auth/location/{location_id}:
 *   delete:
 *     summary: Xóa địa điểm du lịch
 *     description: API để xóa một địa điểm du lịch dựa trên ID.
 *     tags:
 *      - admin-locations
 *     parameters:
 *       - in: path
 *         name: location_id
 *         required: true
 *         description: ID của địa điểm du lịch cần xóa.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa địa điểm du lịch thành công.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Xóa thành công địa điểm du lịch với ID: 123"
 *       404:
 *         description: Lỗi - Không tìm thấy địa điểm du lịch với ID cung cấp.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Không tìm thấy địa điểm du lịch với ID: 123"
 *       500:
 *         description: Lỗi - Không thể xóa địa điểm du lịch.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Lỗi server khi xóa địa điểm du lịch"
 */

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