const express = require('express');
const UserRouter = require('./routes/user.js')
const Router = express.Router();
const authMiddleware = require('../middleware.js');

Router.use("/user",UserRouter); 


module.export = {
  Router
}

// /api/v1/about
// /api/v1/names 
