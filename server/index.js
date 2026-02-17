const express = require('express')
const cors = require('cors')
const app = express()
const axios = require('axios');
require('dotenv').config({ path: './Passwords/pass.env' }); //נתיב להבאת הapi
app.use(express.json())
app.use(cors())
const AirportRoute = require('./Routing/AirportRout');
app.use('/airports', AirportRoute);
const userRoute = require('./Routing/UserRout');
app.use('/user', userRoute);
const mongoose = require('mongoose');
const AiRoute = require('./Routing/AiRout');
app.use('/ai', AiRoute);

const uri = "mongodb+srv://davia:Aa123456@cluster0.yldsfaj.mongodb.net/?appName=Cluster0";

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
};

async function connectToMongo() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(uri, clientOptions);
    console.log("✅ Successfully connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("⚠️ Server will continue to run without MongoDB features.");
  }
}

connectToMongo();

app.listen(3006, () => {
  console.log("-----------------------------------------");
  console.log("🚀 SERVER IS RUNNING ON PORT 3006!!!");
  console.log("📍 API: http://localhost:3006");
  console.log("-----------------------------------------");
});
