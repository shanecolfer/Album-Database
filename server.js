//Require express, body parser, mongodb
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const ejsLocals = require('ejs-locals');
const expressValidator = require('express-validator');


app.engine('html', require('ejs').renderFile);
app.use(bodyParser.json({extended: true}));
app.set('view engine', ejsLocals);
app.use(expressValidator());

//Configure express-session
app.use(session(
{
    //Set maximum age of the cookie in milliseconds
    cookie: 
    {
        maxAge: 1000 * 60 * 60, //Max age of 1 hr
        sameSite: true, //Cookies only accepted from same domain
        secure: true,
    },

    //Set name for the session id cookie
    name: 'session_id',

    resave: false,

    saveUninitialized: false,

    //Set key used to sign cookie
    secret: 'shane'
}
))

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

const redirectLogin = (req, res, next) =>
{
    //If there is a user ID don't allow a login and redirect home
    if(req.session.userID)
    {
        res.redirect('/home');
    }
    else
    {
        next();
    }
}

//Serve browser bootstrap folder
app.use(express.static(__dirname + '/albumDBStudio'));

//Handle signup post request
app.post('/signup', (req, res) => {

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

    

   
})

//Login page route
app.get('/loginpage', redirectLogin, (req,res) =>
{
    res.render('signIn.html');
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
                   req.session.userId = user._id;
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







console.log("Express Baby!");