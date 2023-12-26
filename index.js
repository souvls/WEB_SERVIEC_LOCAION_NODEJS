const express =require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
//use file .env
dotenv.config();

const token = require('./middleware/token');
const isAdmin = require('./middleware/check_admin');

// user
const Service_for_User = require('./services/For_User');
const Authentication_Service = require('./services/Authentication'); 

//admin
const Admin_Service_Location = require('./services/Admin_Service_Location');
const Admin_Service_User = require('./services/Admin_Service_User');
//const Admin_Service_Comment = require('./services/Admin_Serviec_Comment');


//swaggerUI
const { swaggerUI, swaggerSpec } = require('./swagger/swagger');
const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json({limit:'10mb'}));

app.use(Authentication_Service);
//Service for user
app.use(Service_for_User);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(token.jwtValidate,isAdmin,Admin_Service_Location);
app.use(token.jwtValidate,isAdmin,Admin_Service_User);
//papp.use(Admin_Service_Comment);


app.get('/',(req,res)=>{
    res.status(200).json({'msg':'Hello Welcome To My Service.'});
});

// ====> Run server
app.listen(process.env.PORT,()=>{
    console.log('start server:'+' http://localhost:'+process.env.PORT);
})