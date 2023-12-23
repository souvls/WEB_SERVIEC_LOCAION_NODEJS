const mongoose = require('mongoose');

const locationDbConnection = mongoose.createConnection(process.env.DB_LOCATION);

locationDbConnection.on('open', async(err) => {
    if(err){ await console.log(err)}
    await console.log("=> connect db_location")
    }
);

module.exports = locationDbConnection;