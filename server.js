//Require express, body parser, mongodb
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));



//Connect to MongoDB
MongoClient.connect('mongodb+srv://shanecolfer:al1916w@albumdb-7cob3.mongodb.net/test?retryWrites=true&w=majority', (err,client) => {
    
    //If there's a connect error print to console
    if (err)
    {
        return console.log(err);
    }

    db = client.db('musicalbums'); //Db name is albums

    //Function to create server (only if we connect to DB successfully)
    app.listen(3000, function() {
        console.log("Listening on port 3000");
    })
})

//Serve browser bootstrap folder
app.use(express.static(__dirname + '/startbootstrap-one-page-wonder/'));

//Handle post request
app.post('/album', (req, res) => {
    db.collection('albums').insertOne(req.body, (err, result) =>
    {
        //If error inserting, print to console
        if(err)
        {
            return console.log(err);
        }

        //Log succesful POST
        console.log("Album added to DB");
        
    })
})

app.get('/', (req, res) => {
    db.collection('albums').find().toArray(function(err, results)
    {
        console.log(results);
    })
})







console.log("Express Baby!");