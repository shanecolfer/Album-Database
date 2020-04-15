//Require express, body parser, mongodb
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const ejsLocals = require('ejs-locals');
const expressValidator = require('express-validator');
const ObjectID = require('mongodb').ObjectID;

//Configure express-session
app.use(session(
    {
        //Set maximum age of the cookie in milliseconds
        cookie: 
        {
            path: '/',
            maxAge: 1000 * 60 * 60, //Max age of 1 hr
            sameSite: true, //Cookies only accepted from same domain
            secure: false,
        },
    
        //Set name for the session id cookie
        name: 'session_id',
    
        resave: false,
    
        saveUninitialized: false,
    
        //Set key used to sign cookie
        secret: 'shane'
    }
    ))


app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json({extended: true}));
app.set('view engine', ejsLocals);
app.use(expressValidator());



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
app.use(express.static(__dirname + '/albumDBStudio'));

//Handle signup post request
app.post('/signup', (req, res) => {


    //If there's a cookie

    console.log(req.session.session_id);

    if(req.session.session_id == null)
    {
            //Check that email and password aren't blank
        if(req.body.email == '' || req.body.password == '')
        {
            console.log("Empty fields");
            res.sendStatus(403);
            res.end();
        }
        else
        {
            //Check that email doesn't exist
            db.collection('users').find({"email" : req.body.email}).toArray(function(err, results)
            {
                if(err)
                {
                    console.log("error");
                }
                else
                {
                    //If email isn't in DB add it and send back 200
                    if(results.length < 1)
                    {
                        console.log("Results is smaller than 1");
                        db.collection('users').insertOne(req.body, (err, result) =>
                        {
                            //If error inserting, print to console
                            if(err)
                            {
                                return console.log(err);
                                res.sendStatus(500);
                                res.end();
                            }
                    
                            //Log succesful POST
                            console.log("User Added");
                    
                            //Send a 200 OK back
                            res.sendStatus(200);
                            res.end();
                            
                        }) 
                    }
                    else //Else send back a 403
                    {
                        res.sendStatus(403);
                        res.end();
                    }
                }
            });
            
        }
    }
    else
    {
        res.sendStatus(403);
        res.end();
    }
})


//Login page route
app.get('/loginpage', (req,res) =>
{

    //If there's a cookie

    console.log(req.session.session_id);

    if(req.session.session_id == null)
    {
        res.render('signIn.html');
    }
    else
    {
        res.redirect('home.html');
    }

})

//Homepage route
app.get('/home', (req,res) =>
{
    if(req.session.session_id == null)
    {
        res.render('signIn.html');
    }
    else
    {
        res.redirect('home.html');
    }
})

app.get('/favouritespage', (req,res) => 
{
    if(req.session.session_id == null)
    {
        res.render('signIn.html');
    }
    else
    {
        res.redirect('favourites.html');
    }
})

app.post('/login', (req,res) =>
{

    const email = req.body.email;
    const password = req.body.password;

    console.log(email);
    console.log(password);

    //Check that password and email are not empty
    if(email && password)
    {
        //Check that user exists
        db.collection('users').find({"email" : email, "password" : password}).toArray(function(err, results)
        {
            if(err)
            {
                console.log("Error finding user");
            }
            else
            {
                user = results;
                console.log(user);

                if(user.length == 1)
                {
                   req.session.session_id = user[0].email;
                   console.log("Cookie ID: " + req.session.session_id);
                   res.send('/home.html');
                }
                else
                {
                    res.sendStatus(403);
                }
            }
        });
    }
})

//Logout route
app.post('/logout', (req,res) => 
{
    
})

//Get all albums from DB
app.get('/getDatabase', (req,res) =>
{
    //Store entire database as json file
    db.collection('albums').find().toArray(function(err, results)
    {
        if(err)
        {
            console.log("Error retrieving albums from DB");
            res.sendStatus(500);
        }
        else
        {
            console.log("Albums sent to front end");
            res.send(results);
            res.end();
        }
    })
})

//Get some albums from the DB
app.get('/albumSearch', (req,res) =>
{
    console.log("insidesearch");
    var searchTerm = req.query.searchTerm;
    console.log(searchTerm);

    db.collection('albums').find({"Artist": searchTerm}).toArray(function(err, results)
    {
        if(err)
        {
            console.log("Error searching for albums in database");
            console.log(err);
        }
        else
        {
            console.log(results);
            res.send(results);
            res.end();
        }
    })

})

app.put('/addFavourite', (req,res) =>
{
    var albumID = req.body.albumID;
    var userID = req.session.session_id;

    console.log("Album ID server side: " + albumID);
    console.log("Session ID server side: " + req.session.session_id);

    db.collection('users').updateOne({"email": userID}, {$addToSet: {"favourites": albumID}}, function(err,results)
    {
        if(err)
        {
            console.log("Error updating favourite albums");
        }
        else
        {
            console.log(results);
            res.sendStatus(200);
            res.end();
        }
    })
})

app.delete('/delFavourite', (req,res) =>
{
    var albumID = req.body.albumID;
    var userID = req.session.session_id;

    db.collection('users').updateOne({"email": userID}, {$pull: {"favourites": albumID}}, function (err,results)
    {
        if(err)
        {
            console.log("Error deleting favourite album");
        }
        else
        {
            console.log("Sucess deleting favourite album");
            res.sendStatus(200);
            res.end();
        }
    })
})

app.get('/getFavourites', (req,res) =>
{

    //Favourite album array
    var favArray = new Array();

    //Find user
    db.collection('users').find({"email": req.session.session_id}).toArray(function(err, results)
    {
        if(err)
        {
            console.log("Error finding user");
        }
        else
        {   
            console.log(results[0].favourites);

            if(results[0].favourites == null)
            {
                res.sendStatus(500);
                res.end();
            }
            else
            {
                //For each favourite find the related album details
                results[0].favourites.forEach(id =>
                    {
                        console.log(id);
                        var oid = new ObjectID(id);
                        console.log(oid);
                        db.collection('albums').find({"_id": oid}).toArray(function(err, results)
                        {
                            favArray.push(results[0]);
                        });
                    })

                    //Wait until all albums are found
                    setTimeout(function afterSeconds()
                    {
                        res.send(favArray);
                        res.end();
                    }, 500)
            }
            
        }
    })

    
})
/* GRAVEYARD
app.get('/', (req, res) => {
    db.collection('albums').find().toArray(function(err, results)
    {
        console.log(results);
    })
})
app.get('/', (req,res) => {
    db.collection('albums').find().toArray((err, result) => {
        if (err)
        {
            return console.log(err);
        }
        res.render('index.ejs', {albums: result});
    })
})
 /*db.collection('albums').find().toArray((err, result) => {
        if (err)
        {
            return console.log(err);
        }
        res.render('index.ejs', {albums: result});
    })
    
*/
