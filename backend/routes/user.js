const express = require('express');
const app = express();
const zod = require('zod');
const User = require('../db.js')
const JWT_SECRET = require('../config.js')

const signupSchema = zod.object({
  username:zod.string(),
  password:zod.string(),
  firstname:zod.string(),
  lastname:zod.string()
})

const signinSchema = zod.object({
  username:zod.string(),
  password:zod.string()
})

const UserRouter = express.Router();

app.post('/signup',async(req,res)=>{

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
    firstname:req.body.firstname,
    lastname:req.body.lastname,
    password:req.body.password
  })

  const userId = user._id; //mongoDB creates its own id . and we are extracting that id

  const token = jwt.sign({
    userId
  },JWT_SECRET);

  res.status(200).json({
    message:"User Created Succesfully",
    token:token
  })

})

app.post('/signin',async(req,res)=>{
  const success = signinSchema.safeParse(req.body);
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

module.export = {
  UserRouter
}