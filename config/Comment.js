const mongoose = require('mongoose');

const commentDbConnection = mongoose.createConnection(process.env.DB_COMMENT);

commentDbConnection.on('open', async(err) => {
    if(err){ await console.log(err)}
    await console.log("=> connect db_comment")
    }
);

module.exports = commentDbConnection;