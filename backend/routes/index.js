const express = require('express');
const UserRouter = require('./user.js')
const AccountRouter  = require('./account.js')

const Router = express.Router();

// console.log(UserRouter);
// console.log(AccountRouter);

Router.use("/user",UserRouter); 
Router.use("/account",AccountRouter);

module.exports = Router

// /api/v1/about
// /api/v1/names 
