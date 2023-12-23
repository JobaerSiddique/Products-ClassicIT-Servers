const express = require('express');
const  mongoose  = require('mongoose');
const app = express()
const cors = require('cors')
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = 5000 || process.env.PORT;


console.log(process.env.JWT_KEY);

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

userSchema.methods.generateToken= async function (){
    try {
        return jwt.sign({
            userId:this._id.toString(),
            email:this.email
        },
        process.env.JWT_KEY,{
            expiresIn:'1h'
        }
        )
    } catch (error) {
        console.log(error);
    }
}

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

const ProductAddToCart = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    
    color:{
        type:String,
        required:true
    },
    size:{
        type:String,
        required:true
    },
    
    price:{
        type:Number,
        required:true
    },
    
    userEmail:{
        type:String,
        required:true
    },
        
})

const Cart = mongoose.model("Cart",ProductAddToCart)

app.post('/addcart', async(req,res)=>{
    const cart = req.body
    const addCart = await Cart.create(cart)
    res.status(201).send({message:"Add to Cart Successfully",addCart:addCart})
})
app.get('/addcart', async(req,res)=>{
    const email= req.query.email;
    const find={userEmail:email}
    const findCart = await Cart.find(find)
    
    res.status(201).send(findCart)
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
    res.status(200).json({UserCreated,message:"Register Successfully"})
   console.log(UserCreated);
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
        message:"Login Successfully",
        existUser
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