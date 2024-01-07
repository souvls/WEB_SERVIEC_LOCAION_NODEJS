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
    const { fullname, email, password } = req.body;

    //kiểm trả tên, Email đã có trong database chưa?
    User.findOne({ $or: [{ fullname: fullname }, { email: email }] })
        .then(async user => {
            if (user) {
                console.log("=> The user log in with an existing account")
                res.status(400).json({ 'msg': 'Tên hoặc Email đã tồn tại.' })
            } else { //nếu chưa có thì lưu người dùng mới vào database
                const encryptedPassword = await Encrypt.hash(password); //mã hóa mật khẩu
                
                //lưu User mới
                let newUser = new User({
                    fullname: fullname,
                    email: email,
                    password: encryptedPassword,
                    avatar:'no_avatar.png',
                    role: false
                })
                await newUser.save().then(async nUser => {
                    const refreshToken = token.getGenerateRefreshToken(fullname, email, '0', 'no_avatar.png');//tạo Refresh token
                    //lưu refresh token của User mới
                    let newAuth = new Auth({
                        user_id: nUser._id,
                        refresh_token: refreshToken
                    })
                    await newAuth.save().then(async nAuth => {
                        res.status(201).json({
                            'msg': 'Đăng ký thành công.',
                            'id': nUser._id,
                            'fullname': nUser.fullname,
                            'email': nUser.email,
                            'refresh_token': nAuth.refresh_token
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
    const {email, password} = req.body;

    //kiểm tra người dùng này đã có trond DB không?
    await User.findOne({email: email}).then( async result =>{
        if (result) {
            const login = await Encrypt.check(password, result.password); //kiểm tra mật khẩu
            if (login) { // mật khẩu đúng
                //token.DeleteToken() // xóa token cũ 
                const accessToken = token.getGenerateAccessToken(result.fullname, result.email, result.role, result.avatar); //tạo Access Token;
                console.log(`=> ${result.fullname} is login`);
                res.status(200).json({
                    'msg': 'Đăng nhập thành công',
                    'id':result._id,
                    'fullname': result.fullname,
                    'access_token': accessToken
                });
            } else { // mật khẩu sai
                console.log(req.body);
                console.log(`=> Email not exits`);
                res.status(400).json({ 'msg': 'Mật khẩu không đúng', });
            }
        }else{
            console.log(req.body);
            res.status(400).json({ 'msg': 'Email không tồn tại.', });
        }
    }).catch( err =>{
        console.log(err+",find User");
        res.status(500).json({'msg':'Lỗi database'})
    });
})

module.exports = router;