const express =require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
dotenv.config();

//User
const Service_for_User = require('./services/For_User');
const Authentication_Service = require('./services/Authentication'); 

//admin
const Admin_Service_Location = require('./services/Admin_Service_Location');
const Admin_Service_User = require('./services/Admin_Service_User');
//const Admin_Service_Comment = require('./services/Admin_Serviec_Comment');


const { swaggerUI, swaggerSpec } = require('./swagger/swagger');
const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json({limit:'10mb'}));
app.use(express.static('uploads'));


//=> Không có token vẫn dùng đượcAPI
app.use(Authentication_Service);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.get('/',(req,res)=>{
    res.status(200).json({'msg':'Hello Welcome To My Service.'});
});

//=> phải có token mới dùng đượcAPI
app.use(Service_for_User);

//=> phải là Admin mới dùng được API
const token = require('./middleware/token');
const isAdmin = require('./middleware/check_admin');
app.use(token.jwtValidate,isAdmin,Admin_Service_Location);
app.use(token.jwtValidate,isAdmin,Admin_Service_User);
//app.use(Admin_Service_Comment);


//====> Run server
app.listen(process.env.PORT,()=>{
    console.log('start server:'+' http://localhost:'+process.env.PORT);
})