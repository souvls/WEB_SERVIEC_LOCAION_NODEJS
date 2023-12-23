const mongoose = require('mongoose');

const userDbConnection = mongoose.createConnection(process.env.DB_USER,);

userDbConnection.on('open', async(err) => {
    if(err){ await console.log(err)}
    await console.log("=> connect db_user")
    }
);

module.exports = userDbConnection;