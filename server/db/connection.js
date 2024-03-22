import mongoose from "mongoose";

const url = 'mongodb+srv://'

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true}).then(()=>console.log('connected to db')).catch((e=>console.log('Error',e)))