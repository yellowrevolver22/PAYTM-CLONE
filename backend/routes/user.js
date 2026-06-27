const express = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken')
const JWT_SECRET = require('../config.js')
const { Account,User } = require('../db.js')
const authMiddleware = require('../middleware.js');

const signupSchema = zod.object({
  username:zod.string(),
  password:zod.string(),
  firstName:zod.string(),
  lastName:zod.string()
})

const signinSchema = zod.object({
  username:zod.string(),
  password:zod.string()
})

const updateSchema = zod.object({
  firstname:zod.string().optional(),
  lastname:zod.string().optional(),
  password:zod.string().optional()
})

const Router = express.Router();

Router.put('/',authMiddleware,async(req,res)=>{
  const {success} = updateSchema.safeParse(req.body);

  if(!success){
    return res.status(411).json({
      message:"Error while updating information"
    })
  }

  await User.updateOne({_id:req.userId},req.body);

  res.status(200).json({
    message:"Updated Succesfully"
  })
})

Router.post('/signup',async(req,res)=>{
  const body = req.body; //check for request body format
  const {success} = signupSchema.safeParse(body);
  if(!success){
    return res.status(411).json({
      message:"incorrect inputs"
    })
  }

  const existingUser = await User.findOne({ //check for is user existed, no need for signing up
    username:req.body.username
  })
  if(existingUser){
    return res.status(411).json({
      message:"email already taken"
    })
  }

  const user = await User.create({
    username:req.body.username,
    password:req.body.password,
    firstName:req.body.firstName,
    lastName:req.body.lastName
  })

  const userId = user._id; //mongoDB creates its own id . and we are extracting that id

  await Account.create({
    userId,
    balance:1 + Math.random()*10000
  })

  const token = jwt.sign({
    userId
  },JWT_SECRET);

  res.status(200).json({
    message:"User Created Succesfully",
    token:token
  })

})

Router.post('/signin',async(req,res)=>{
  console.log(req.body);
  const {success} = signinSchema.safeParse(req.body);
  console.log(success);

  if(!success){
    return res.status(411).json({
      message:"error while logging"
    })
  }

  const existingUser = await User.findOne({
    username:req.body.username
  })

  if(!existingUser){
    return res.status(411).json({
      message:"error while logging"
    })
  }

  const userId = existingUser._id;

  const token = jwt.sign({
    userId
  },JWT_SECRET);

  res.status(200).json({
    token:token
  })
})

Router.get('/bulk',async(req,res)=>{
  const filterName = req.query.filter||"";

  const users = await User.find({
    $or:[{
      firstName:{
        "$regex":filter
      }
    },{
      lastName:{
        "$regex":filter
      }
    }]
  })

  res.json({
    user:users.map(user=>({
      username:user.username,
      firstName:user.firstName,
      lastName:user.lastName,
      _id:user._id
    }))
  })
})

module.exports = Router