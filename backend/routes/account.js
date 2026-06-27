const express = require('express');
const Account = require('../db.js');
const authMiddleware = require('../middleware.js')

const Router = express.Router();

Router.get('/balance',authMiddleware,async (req,res)=>{
  const account = await Account.findOne({
    userId:req.userId
  });

  return res.status(200).json({
    balance: account.balance
  })
})

Router.post('/transfer',authMiddleware,async(req,res)=>{
  const session = await mongoose.startSession();

  session.startTransaction();
  const {amount,to} = req.body;

  const account = await Account.findOne({
    userId: req.userId
  }).session(session);

  if(account.balance<amount){
    await session.abortTransaction();
    return res.status(400).json({
      message:"Insufficient Balance"
    })
  }

  const toAccount = await Account.findOne({
    userId:to.userId
  }).session(session)

  if(!toAccount){
    await session.abortTransaction();
    return res.status(400).json({
      message:"invalid person"
    })
  }

  await Account.updateOne({
    userId:req.userId
  },{
    $inc:{
      balance: -amount
    }
  }).session(session);

  await Account.updateOne({
    userId:to
  },{
    $inc:{
      balance: amount
    }
  }).session(session);

  await session.commitTransaction();
  res.status(200).json({
    message:"Transaction Succesfull"
  })

})

module.exports=Router