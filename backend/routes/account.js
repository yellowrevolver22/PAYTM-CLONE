const express = require('express');
const mongoose = require('mongoose');
const {Account} = require('../db.js');
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
  console.log("req.userId:", req.userId);
  console.log("to:", req.body.to);

  const session = await mongoose.startSession();
  session.startTransaction();


  const {amount,to} = req.body;

  const account = await Account.findOne({
    userId: req.userId
  }).session(session);
  console.log("Sender balance:", account.balance);


  if(account.balance<amount){
    await session.abortTransaction();
    return res.status(400).json({
      message:"Insufficient Balance"
    })
  }

  const toAccount = await Account.findOne({
    userId:to
  }).session(session)

  console.log("Receiver balance:", toAccount.balance)

  if(!toAccount){
    await session.abortTransaction();
    return res.status(400).json({
      message:"invalid person"
    })
  }

  const senderResult = await Account.updateOne({
    userId:req.userId
  },{
    $inc:{
      balance: -amount
    }
  }).session(session);

  console.log("sender",senderResult);

  const recieverResult = await Account.updateOne({
    userId:to
  },{
    $inc:{
      balance: amount
    }
  }).session(session);

  console.log("reciver",recieverResult);

  console.log("about to commit");
  await session.commitTransaction();
  console.log("Committed");
  res.status(200).json({
    message:"Transaction Succesfull"
  })

})

module.exports=Router