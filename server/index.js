const express = require('express')
let cors = require('cors');
const app = express()
app.use(express.json())
app.use(cors());
const AirportRoute = require('./Routing/AirportRout');
app.use('/airports', AirportRoute);
const userRoute = require('./Routing/UserRout');
app.use('/user', userRoute);
const mongoose = require('mongoose');

const uri = "mongodb+srv://davia:Aa123456@cluster0.yldsfaj.mongodb.net/?appName=Cluster0";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  finally { 
    // Ensures that the client will close when you finish/error
    // await mongoose.disconnect();
  }
}
run().catch(console.dir);
app.listen(3005, () => {
  console.log("server is good, port 3005!");

})


