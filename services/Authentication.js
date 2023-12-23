const express = require('express');
const router = express.Router();

router.get("/login",(req,res)=>{
    console.log('get.login');
})
router.get("/register",(req,res)=>{
    console.log('get.register');
})
router.post("/register", (req, res) => {
    //model
    const User = require('../models/User');
    const Auth = require("../models/Authentication");
    //middleware
    const Encrypt = require('../middleware/encrypt');
    const token = require('../middleware/token');
    const { Fullname, Email, Password } = req.body;

    //kiểm trả tên, Email đã có trong database chưa?
    User.findOne({ $or: [{ Fullname: Fullname }, { Email: Email }] })
        .then(async user => {
            if (user) {
                console.log("=> The user log in with an existing account")
                res.status(400).json({ 'msg': 'Tên hoặc Email đã tồn tại.' })
            } else { //nếu chưa có thì lưu người dùng mới vào database
                const encryptedPassword = await Encrypt.hash(Password); //mã hóa mật khẩu
                
                //lưu User mới
                let newUser = new User({
                    Fullname: Fullname,
                    Email: Email,
                    Password: encryptedPassword,
                    Avatar:'no_avatar.png',
                    Role: false
                })
                await newUser.save().then(async nUser => {
                    const refreshToken = token.getGenerateRefreshToken(Fullname, Email, '0');//tạo Refresh token
                    //lưu refresh token của User mới
                    let newAuth = new Auth({
                        UserID: nUser._id,
                        Refresh_Token: refreshToken
                    })
                    await newAuth.save().then(async nAuth => {
                        res.status(201).json({
                            'msg': 'Đăng ký thành công.',
                            'id': nUser._id,
                            'Fullname': nUser.Fullname,
                            'Email': nUser.Email,
                            'Refresh_token': nAuth.Refresh_Token
                        });
                    }).catch(err => {
                        console.log(err + ",insert new authentication");
                        res.status(500).json({'msg':'Lỗi database'});
                    });
                }).catch(err => { 
                    console.log(err + ",insert new user");
                    res.status(500).json({'msg':'Lỗi database'});
                });
            }
        }).catch(err => {
            console.log(err + ",find user");
            res.status(500).json({'msg':'Lỗi database'})
        });
})

router.post("/login",async (req,res)=>{
    //model
    const User = require('../models/User');
    //middleware
    const Encrypt = require('../middleware/encrypt');
    const token = require('../middleware/token');
    const {Email,Password} = req.body;

    //kiểm tra người dùng này đã có trond DB không?
    await User.findOne({Email:Email}).then( async result =>{
        if (result) {
            const login = await Encrypt.check(Password, result.Password); //kiểm tra mật khẩu
            if (login) { // mật khẩu đúng
                //token.DeleteToken() // xóa token cũ 
                const accessToken = token.getGenerateAccessToken(result.Fullname, result.Email, result.Role); //tạo Access Token;
                console.log(`=> ${result.Fullname} is login`);
                res.status(200).json({
                    'msg': 'Đăng nhập thành công',
                    'id':result._id,
                    'Fullname': result.Fullname,
                    'Access_TOKEN': accessToken
                });
            } else { // mật khẩu sai
                console.log(`=> Email not exits`);
                res.status(400).json({ 'msg': 'Mật khẩu không đúng', });
            }
        }else{
            res.status(400).json({ 'msg': 'Email không tồn tại.', });
        }
    }).catch( err =>{
        console.log(err+",find User");
        res.status(500).json({'msg':'Lỗi database'})
    });
})

module.exports = router;