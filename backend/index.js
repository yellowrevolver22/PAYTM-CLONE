const express = require("express");
const MainRouter = require('./routes/index.js');
const app = express();

const cors = require('cors');

app.use(cors()); // allow all routes access to backend
app.use(express.json()); // allow json incoming to converted into js

app.use('/api/v1',MainRouter);

app.listen(3000);


