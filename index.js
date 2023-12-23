const express = require('express');
const  mongoose  = require('mongoose');
const app = express()
const cors = require('cors')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
require('dotenv').config()
const port = 5000 || process.env.PORT;


app.use(cors())
app.use(express.json())

const url = process.env.DB_URL
mongoose.connect(url)
.then(()=>{
    console.log('database Connect Successfully');
})

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
})

const User = mongoose.model("User",userSchema)

const ProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    img:{
        type:String,
        required:true
    },
    variations: [{
        color: String,
        size: String,
        
      }]
})

const Product = mongoose.model('Product',ProductSchema)

app.get('/', (req,res)=>{
    res.send("Hello Server is Running")
})


app.post('/register', async(req,res)=>{
    const {email,password,name,image} = req.body
    
    const existUser = await User.findOne({email})
if(existUser){
    return res.status(400).send({message:"User Already Registerd"})
}
const saltRound = 10;
const hash_password = await bcrypt.hash(password,saltRound)
    const UserCreated = await User.create({email,password:hash_password,name,image})
    res.status(200).send({UserCreated,message:"Register Successfully"})
   
})
app.post('/login', async(req,res)=>{
   try {
    const {email,password} = req.body
    
    const existUser = await User.findOne({email})
    
if(!existUser){
    return res.status(400).send({message:"Invalid Credentials"})
}
const user = await bcrypt.compare(password,existUser.password)

   if(user){
    res.send({
        message:"Login Successfully"
    })
   }
   } catch (error) {
    res.status(403).send('Internal Error')
   }
})

app.get('/user',async(req,res)=>{
    try {
        const user = await User .find()
        res.send(user)
    } catch (error) {
        
    }
})

app.get('/products', async(req,res)=>{
    try {
        const products = await Product.find()
        res.send(products)
    } catch (error) {
        
    }
})
app.get('/products/:id', async(req,res)=>{
    try {
        const id = req.params.id
        const filter = {_id:new ObjectId(id)}
        const products = await Product.findOne(filter)
        res.send(products)
    } catch (error) {
        
    }
})

app.listen(port,()=>{
    console.log(`Server is running ${port}`);
})