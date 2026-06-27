const JWT_SECRET = require('./config.js')
const jwt = require('jsonwebtoken');

function authMiddleware(req,res,next){
  const authHeader = req.headers.authorization;

  if(!authHeader || !authHeader.startsWith('Bearer')){
    return res.status(403).json({});
  }

  const token = authHeader.split(' ')[1]; //Authorization: Bearer 2546b3k7h423g5j5-->actual token so split is [bearer,2546b3k7h423g5j5]

  try{
    const decoded = jwt.verify(token,JWT_SECRET);
    req.userId = decoded.userId;
    next();
  }
  catch(err){
    return res.status(403).json({err})
  }
} 

module.exports = authMiddleware