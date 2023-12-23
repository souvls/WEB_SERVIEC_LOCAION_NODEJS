const User = require('../models/User');
const isAdmin = async (req,res,next)=>{
    await User.findOne({Email:req.data.email}).then((result)=>{
        if(result.Role === true){
            return next();
        }else{
            console.log('=> not admin');
            res.status(401).json({'msg':'Bạn không phải admin.'})
        }
    }).catch(()=>{
        
    })
    
}
module.exports = isAdmin