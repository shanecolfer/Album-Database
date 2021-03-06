//Require express, body parser, mongodb
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const ejsLocals = require('ejs-locals');
const expressValidator = require('express-validator');
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');
const sRounds = 12;

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


//Use EJS to render html files, use express validator for cookies and bodyparser to parse JSONs
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

                        //Hash the password using bcrypt
                        bcrypt.hash(req.body.password, sRounds, function(err, hash)
                        {
                            //If error send 500
                            if(err)
                            {
                                console.log("Error hashing password");
                                res.sendStatus(500);
                                res.end();
                            }
                            else
                            {
                                //Make the password equal to the hash and insert the user
                                req.body.password = hash;
                                console.log(hash);

                                db.collection('users').insertOne(req.body, (err, result) =>
                                {
                                    //If error inserting, print to console
                                    if(err)
                                    {
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
        res.render('home.html');
    }

})

//Homepage route
app.get('/home', (req,res) =>
{
    //If there's a cookie
    if(req.session.session_id)
    {
        res.render('home.html');
    }
    else
    {
        res.render('signIn.html');
    }
})

//Route for the user favourites page
app.get('/favouritespage', (req,res) => 
{
    //Check if there's a session ID
    if(req.session.session_id == null)
    {
        res.render('signIn.html');
    }
    else
    {
        res.render('favourites.html');
    }
})

//Route for the add album page
app.get('/addpage', (req,res) => 
{
    //Check if there's a session ID
    if(req.session.session_id == null)
    {
        res.render('signIn.html');
    }
    else
    {
        res.render('add.html');
    }
})

//Route for /
app.get('/', (req,res) =>
{   
    //Check if there's a session ID
    if(req.session.session_id == null)
    {
        res.render('index.html');
    }
    else
    {
        res.render('home.html');
    }
})

//Route to login
app.post('/login', (req,res) =>
{

    const email = req.body.email;
    const password = req.body.password;

    //Check that password and email are not empty
    if(email && password)
    {
        //Check that user exists
        db.collection('users').find({"email" : email}).toArray(function(err, results)
        {
            if(err)
            {
                console.log("Error finding user");
            }
            else
            {
                user = results;

                //If one user has been found
                if(user.length == 1)
                {
                    //Compare the plaintext password to the hash password stored
                    bcrypt.compare(password, user[0].password, function(err, result)
                    {
                        //If error
                        if(err)
                        {
                            console.log("Error comparing hashes")
                            res.sendStatus(500);
                            res.end();
                        }
                        else
                        {
                            //If hashs are the same, create a cookie and send user home
                            if(result == true)
                            {
                                req.session.session_id = user[0].email;
                                console.log("Cookie ID: " + req.session.session_id);
                                res.send('/home');
                            }
                            else
                            {
                                //If hashs are not the same, send a 403
                                res.sendStatus(403);
                                res.end();
                            }
                        }
                        
                    })
                }
                else
                {
                    res.sendStatus(403);
                    res.end();
                }

            }
        });
    }
    else
    {
        //If password or email has not been provided, send a 403
        res.sendStatus(403);
        res.end();
    }
})

//Route to an an album
app.post('/addalbum', (req,res) => 
{
    const album = req.body.Album;
    const artist = req.body.Artist;
    const year = req.body.Year;
    const genre = req.body.Genre;

    console.log(album + artist + year + genre);

    //Check that title, artist, year and genre are not empty
    if (album && artist && year && genre)
    {
        //Check if album is already in DB
        db.collection('albums').find({"Album": album, "Artist": artist}).toArray(function(err, results)
        {
            if(err)
            {
                console.log("Error checking if album exists");
            }
            else
            {
                //If album isn't in DB add it and send back 200 OK
                if(results.length < 1)
                {
                    db.collection('albums').insertOne(req.body, (err,result) =>
                    {
                        if(err)
                        {
                            console.log("Error adding album to DB");
                            res.sendStatus(500);
                            res.end();
                        }
                        else
                        {
                            console.log("Album added");
                            
                            //Send a 200 OK
                            res.sendStatus(200);
                            res.end();
                        }
                    })
                }
                else
                {
                    //Send back 403, album exists
                    res.sendStatus(403);
                    res.end();
                }
            }
        })
    }
    else
    {
        //Send back 403, bad input
        res.sendStatus(403);
        res.end();
    }
})

//Logout route
app.get('/logout', (req,res) => 
{
    console.log(req.session.session_id);
    req.session.destroy(err => 
    {
        res.render('index.html');
    })
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

//Route to add a favourite album
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

//Route to delete a favourite album
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

//Route to delete an album from the DB
app.delete('/delAlbum', (req,res) =>
{
    //Get album ID from request body
    var albumID = req.body.albumID;

    //Create id object from album ID
    var oid = new ObjectID(albumID);

    //Delete related album from DB
    db.collection('albums').deleteOne({"_id": oid}, function(err, results)
    {
        if(err)
        {
            console.log("Error deleting album from DB");
            res.sendStatus(500);
            res.end();
        }
        else
        {
            console.log("Success deleting album from DB");
            res.sendStatus(200);
            res.end();
        }
    })
})

//Route to update an albums details
app.put('/updateAlbum', (req,res) =>
{
    //Read in variables from request JSON
    var albumID = req.body._id;
    var album = req.body.Album;
    var artist = req.body.Artist;
    var year = req.body.Year;
    var genre = req.body.Genre;

    //Create id object from album ID
    var oid = new ObjectID(albumID);

    console.log(albumID);
    console.log(oid);

    //If all of these variables are not undefined
    if(albumID && album && artist && year && genre)
    {
        //Update album with all new fields
        db.collection('albums').updateOne({"_id": oid}, {$set: {"Album": album, "Artist": artist, "Year": year, "Genre": genre}}, function(err,results)
        {
            if(err)
            {
                console.log(err);
                res.sendStatus(500);
                res.end();
            }
            else
            {
                console.log("Success updating database");
                res.sendStatus(200);
                res.end();
            }
        })
    }
    else
    {
        console.log("Invalid variables");

        //Send forbidden
        res.sendStatus(403);
        res.end();
    }

    
})


//Route to retrieve users favourites
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
                            //If the favourite album hasn't been removed from the DB at some point
                            if(results[0])
                            {
                                favArray.push(results[0]);
                            }
                        });
                    })


                    //Wait until all albums are found
                    setTimeout(function afterSeconds()
                    {
                        console.log(favArray);
                        res.send(favArray);
                        res.end();
                    }, 500)
            }
            
        }
    })

    
})

