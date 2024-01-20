const mongoose = require('mongoose');


const favoriteDbConnection = mongoose.createConnection(process.env.DB_LOCATION);

favoriteDbConnection.on('open', async(err) => {
    if(err){ await console.log(err)}
    await console.log("=> connect db_favourite")
    }
);

module.exports = favoriteDbConnection;