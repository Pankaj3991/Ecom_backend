const mongoose = require("mongoose");

// const Connection = ()=> {
//     mongoose.connect(process.env.DB_URI).then((data)=>{
//         console.log(`Database is connected with server: ${data.connection.host}`);
//     })
// }
const Connection = ()=> {
    mongoose.connect(process.env.ATLAS_URI).then((data)=>{
        console.log(`Database is connected with server: ${data.connection.host}`);
    })
}

module.exports = Connection;