const express = require('express');
const router = express.Router();

router.delete("auth/comments",async (req,res)=>{
    const Comemnt = require('../models/Comment');
    console.log('shjhsfj');
    // await Comemnt.findByIdAndDelete(id).then(()=>{
    //     console.log('=> admin delete coment');
    //     res.status(500).json({'msg':'Xóa commemnt thành công.'})
    // }).catch((err)=>{
    //     console.log(err);
    // })

});
module.exports = router;