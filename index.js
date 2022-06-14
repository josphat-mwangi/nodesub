const express = require('express');
const app = express();
const mongoose = require('mongoose')
const doenv = require('dotenv');
// import Routes
const authRoute = require('./routes/auth');
const subRoute = require('./routes/sub');

doenv.config();

// connect to DB
mongoose.connect(process.env.DB_CONNENCT, ()=> console.log('Connected to DB'));



// middleware
app.use(express.json());



//route middleware
app.use('/api/user', authRoute);
app.use('/api/', subRoute);



app.listen(3000, ()=> console.log("running perfectly"))