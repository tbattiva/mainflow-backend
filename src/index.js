const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');



app = express();

mongoose.connect(
    'mongodb+srv://mainflow:mainflow2020@cluster0-yef6o.mongodb.net/maindb?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)

app.use(cors());
app.locals.flowInstances = {};
app.use(express.json());
app.use(routes);



app.listen(3333);