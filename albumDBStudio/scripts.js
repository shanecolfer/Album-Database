
$(function()
{
    $('#signup').on('submit', function(event)
    {
        event.preventDefault();

        var email = $('#email');
        var password = $('#password');

        console.log(email.val());
        console.log(password.val());

        $.ajax(
        {
            url: '/signup',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({email: email.val(), password: password.val()}),  
            
            success: function(response)
            {
                console.log(response);
                var signUpForm = $('#tbody');

                signUpForm.html('');

                signUpForm.append('User Added!');   
            },
            error: function(response)
            {
                console.log(response);
                var signUpForm = $('#tbody');

                signUpForm.html('');

                signUpForm.append('Invalid User Credentials!');
            }
        })
    })

    $('#signin').on('submit', function(event)
    {
        event.preventDefault();

        var email = $('#email');
        var password = $('#password');

        console.log(email.val());
        console.log(password.val());

        console.log("Sign in button pressed");

        $.ajax(
        {
            url: '/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({email: email.val(), password: password.val()}),  
            
            success: function(response)
            {
                //Move to location of response (URL)
                window.location.href = response;
            },
            error: function(response)
            {
                var signInForm = $('#tbody');

                signInForm.html('');

                signInForm.append('Invalid User Credentials!');
            }
        })
    })

    $('#addalbumbutton').on('click', function(event)
    {
        console.log("Add album clicked");

        var title = $('#title');
        var artist = $('#artist');
        var year = $('#year');
        var genre = $('#genre');

        console.log(title.val());

        $.ajax(
            {
                url: '/addalbum',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({"Album": title.val(), "Artist": artist.val(), "Year": year.val(), "Genre": genre.val()}),

                success: function(response)
                {
                    var output = $('#sout');
                    output.html('');
                    output.append('Album added to DB!');
                },
                error: function(response)
                {
                    var output = $('#sout');
                    output.html('');
                    output.append('Album already exists or is invalid! :(');
                }
            }
        )
    })

    $('#search').keypress(function(event)
    {

        var code = event.keyCode || event.which;

        //If key pressed is enter
        if(code == '13')
        {
            console.log("Enter");
            $('#mainCard').html('');

            var searchVal = $('#search').val();

            console.log(searchVal);

            $.ajax(
                {
                    url: '/albumSearch',
                    method: 'GET',
                    contentType: 'application/json',
                    data: $.param({searchTerm: searchVal}),
                    
                    success: function(response)
                    {
                        const albums = response;
                        var cards = $('#mainCard');
                        
                        albums.forEach(album => 
                        {
                            cards.append(` <div class="col">
                    <div class="card" style = "margin: 40px" id = "card`+album._id+`">
                        <div class="card-body" id = "div`+album._id+`">
                            <h4 class="card-title" id = "title`+album._id+`">`+album.Album+ `</h4>
                            <h5 class="text-muted card-subtitle mb-2" id = "artist`+album._id+`">`+album.Artist+`</h6>
                            <h6 class="text-muted card-subtitle mb-2" id = "year`+album._id+`">`+album.Year+`</h6>
                            <h6 class="text-muted card-subtitle mb-2" id = "genre`+album._id+`">`+album.Genre+`</h6>
                            <button class="btn btn-warning" id = "`+album._id+`" type = "button" style = "margin: 10px;">Edit</button>
                            <button class="btn btn-info" id = "`+album._id+`" type="button" style="margin: 10px; background-color: #f25a64"">&#10084</button>
                            <button class="btn btn-danger" id = "`+album._id+`" type="button" style="margin: 10px;">Remove</button>
                    </div>
                </div>`);
                        })
                    },
                    error: function(response)
                    {
                        console.log(response);
                    }
    
                })
        }

    })

    //On click 
    $(document).bind('click', function(event)
    {
        console.log("There's been a click")

        //If the click is an album on the main list
        if($(event.target).hasClass('btn btn-info'))
        {
            //Get the album ID (which is the button ID)
            albumIDval = event.target.id;
            console.log(albumIDval);

            //Ajax request
            $.ajax(
                {
                    url: '/addFavourite',
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({albumID: albumIDval}),
                    
                    success: function(response)
                    {
                        console.log(response);

                        $(event.target).html('&#10004;');
                        $(event.taget).prop('disabled', true);
                    },
                    error: function(response)
                    {
                        console.log(response);
                    }
                }
            )
        }

        //If the click is a remove
        if($(event.target).hasClass('btn btn-danger'))
        {

            //If we're on the home window remove from DB (not favourites)
            if(window.location.pathname == "/home")
            {
                 //Get the album ID (which is the button ID)
                 albumIDval = event.target.id;

                 console.log("Album ID of Button: " + albumIDval);

                 $.ajax(
                     {
                         url: 'delAlbum',
                         method: 'DELETE',
                         contentType: 'application/json',
                         data: JSON.stringify({albumID: albumIDval}),

                        success: function(response)
                        {
                            //Write removed to button
                            $("#"+ "card" +albumIDval).html('');
                        },
                        error: function(response)
                        {
                            console.log(response);
                            //Write error to button
                            $(event.target).html('Error please reload');
                        }
                     }
                 )
            }
            else
            {
                //Get the album ID (which is the button ID)
                albumIDval = event.target.id;

                console.log(albumIDval);

                //Ajax request
                $.ajax(
                    {
                        url: 'delFavourite',
                        method:'DELETE',
                        contentType: 'application/json',
                        data: JSON.stringify({albumID: albumIDval}),

                        success: function(response)
                        {
                            //Write removed to button
                            $("#"+ "card" +albumIDval).html('');
                        },
                        error: function(response)
                        {
                            console.log(response);
                            //Write removed to button
                            $(event.target).html('Error please reload');
                        }
                    }
                )
            }
            
        }
        
        //If the click is an edit button
        if($(event.target).hasClass('btn btn-warning'))
        {
            console.log(event.target.id);

            //Get the specific div ID
            divID = "div" + event.target.id;
            //Get album ID
            albumID = event.target.id;

            //Get album attributes
            album = $("#" + "title" + albumID).text();
            artist = $("#" + "artist" + albumID).text();
            year = $("#" + "year" + albumID).text();
            genre = $("#" + "genre" + albumID).text();

            console.log("Before: ")
            console.log(album)
            console.log(artist)
            console.log(year)
            console.log(genre)

            console.log(divID);

            $("#" + divID).html('');
            $("#" + divID).append(`<form id = "div`+albumID+`">
            <h2 class="sr-only">Login Form</h2>
            <div class="illustration">
                <h3>Edit Album Details</h3>
            </div>
            <div class="form-group"><input class="form-control" type="text" id = "updatedtitle`+albumID+`" placeholder="`+album+`" value = "`+album+`" required="required" minlength="1"></div>
            <div class="form-group"><input class="form-control" type="text" id = "updatedartist`+albumID+`"  placeholder="`+artist+`" value = "`+artist+`" required="required" minlength="1"></div>
            <div class="form-group"><input class="form-control" type="number" id = "updatedyear`+albumID+`"  placeholder="`+year+`" value = "`+year+`" required="required" minlength="3"></div>
            <div class="form-group"><input class="form-control" type="text" id = "updatedgenre`+albumID+`"  placeholder="`+genre+`" value = "`+genre+`" required="required" minlength="1"></div>
            <div class="form-group"><button class="btn btn-secondary" type="button" id = "`+albumID+`">Edit!</button></div><a class="forgot" href="#" id = "sout`+albumID+`"></a></form>
            `);

        }

        //If the click is an edit submit
        if($(event.target).hasClass('btn btn-secondary'))
        {
            console.log("Submit edit pushed");

            //Get album ID
            albumID = event.target.id;

            console.log("AlbumID: " + albumID);

            //Get updated album attributes
            album = $("#" + "updatedtitle" + albumID).val();
            artist = $("#" + "updatedartist" + albumID).val();
            year = $("#" + "updatedyear" + albumID).val();
            genre = $("#" + "updatedgenre" + albumID).val();

            //Ajax request
            $.ajax(
                {
                    url: '/updateAlbum',
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({"_id": albumID, "Album": album, "Artist": artist, "Year": year, "Genre": genre}),
                    
                    success: function(response)
                    {
                        console.log(response);

                        $(event.target).html('Updated');
                        $(event.taget).prop('disabled', true);

                        console.log(window.location.href);
                        console.log(window.location.pathname);
                        

                        if(window.location.pathname == "/home" || window.location.pathname == "/")
                        {
                            //Re display album card showing new
                            $("#" + "div" + albumID).html('');

                            $("#" + "div" + albumID).append(`<h4 class="card-title" id = "title`+albumID+`">`+album+ `</h4>
                            <h5 class="text-muted card-subtitle mb-2" id = "artist`+albumID+`">`+artist+`</h6>
                            <h6 class="text-muted card-subtitle mb-2" id = "year`+albumID+`">`+year+`</h6>
                            <h6 class="text-muted card-subtitle mb-2" id = "genre`+albumID+`">`+genre+`</h6>
                            <button class="btn btn-warning" id = "`+albumID+`" type = "button" style = "width: 100px; margin: 10px">Edit</button>
                            <button class="btn btn-info" id = "`+albumID+`" type="button" style="width: 100px; background-color: #f25a64">&#10084</button>
                            <button class="btn btn-danger" id = "`+albumID+`" type="button" style="margin: 10px;">Remove</button>`);
                        }
                        else
                        {

                            //Re display album card showing new
                            $("#" + "div" + albumID).html('');
                            
                            $("#" + "div" + albumID).append(`<h4 class="card-title" id = "title`+albumID+`">`+album+ `</h4>
                            <h5 class="text-muted card-subtitle mb-2" id = "artist`+albumID+`">`+artist+`</h6>
                            <h6 class="text-muted card-subtitle mb-2" id = "year`+albumID+`">`+year+`</h6>
                            <h6 class="text-muted card-subtitle mb-2" id = "genre`+albumID+`">`+genre+`</h6>
                            <button class="btn btn-warning" id = "`+albumID+`" type = "button style = "margin: 10px;">Edit</button>
                            <button class="btn btn-danger" id = "`+albumID+`" type="button" style="margin: 10px;">Remove</button>`);
                        }


                        
                    },
                    error: function(response)
                    {
                        console.log(response);

                        if(response.status == 403)
                        {
                            //Print error message (One or many fields missing)
                            $("#" + "sout" + albumID).html('');
                            $("#" + "sout" + albumID).append('<font color = "red">Please include all fields!</font>');
                        }
                        else if (response.status == 500)
                        {
                            //Print error message (One or many fields missing)
                            $("#" + "sout" + albumID).html('');
                            $("#" + "sout" + albumID).append('<font color = "red">Server error!</font>');
                        }
                        
                    }
                }
            )

            
        }
        
    });

});

function getDatabase()
{
    $.ajax(
        {
            url: '/getDatabase',
            method: 'GET',
            contentType: 'application/json',

            success: function(response)
            {
                const albums = response;
                var cards = $('#mainCard');
                
                albums.forEach(album => 
                {
                    cards.append(` <div class="col">
                    <div class="card" style = "margin: 40px" id = "card`+album._id+`">
                        <div class="card-body" id = "div`+album._id+`" style = "margin: 10px" >
                            <h4 class="card-title" id = "title`+album._id+`">`+album.Album+ `</h4>
                            <h5 class="text-muted card-subtitle mb-2" id = "artist`+album._id+`">`+album.Artist+`</h6>
                            <h6 class="text-muted card-subtitle mb-2" id = "year`+album._id+`">`+album.Year+`</h6>
                            <h6 class="text-muted card-subtitle mb-2" id = "genre`+album._id+`">`+album.Genre+`</h6>
                            <button class="btn btn-warning" id = "`+album._id+`" type = "button" style = "width: 100px; margin: 10px">Edit</button>
                            <button class="btn btn-info" id = "`+album._id+`" type="button" style="width: 100px; background-color: #f25a64">&#10084</button>
                            <button class="btn btn-danger" id = "`+album._id+`" type="button" style="margin: 10px;">Remove</button>
                    </div>
                </div>`);
                })
            },
            error: function(response)
            {
                console.log(response);
            }

        }
    )
}

function getFavourites()
{
    $.ajax(
        {
            url: '/getFavourites',
            method: 'GET',
            contentType: 'application/json',

            success: function(response)
            {
                const albums = response;
                var cards = $('#mainCard');
                var heading = $('#info');

                if(albums.length < 1)
                {
                    heading.html('');
                    heading.append('<h2> No favourites yet! <h2>');
                }
                else
                {
                    albums.forEach(album => 
                        {
                            cards.append(` <div class="col">
                            <div class="card" style = "margin: 40px" id = "card`+album._id+`">
                                <div class="card-body" id = "div`+album._id+`" style = "margin: 10px">
                                    <h4 class="card-title" id = "title`+album._id+`">`+album.Album+ `</h4>
                                    <h5 class="text-muted card-subtitle mb-2" id = "artist`+album._id+`">`+album.Artist+`</h6>
                                    <h6 class="text-muted card-subtitle mb-2" id = "year`+album._id+`">`+album.Year+`</h6>
                                    <h6 class="text-muted card-subtitle mb-2" id = "genre`+album._id+`">`+album.Genre+`</h6>
                                    <button class="btn btn-warning" id = "`+album._id+`" type = "button style = "margin: 10px;">Edit</button>
                                    <button class="btn btn-danger" id = "`+album._id+`" type="button" style="margin: 10px;">Remove</button>
                            </div>
                        </div>`);
                        })
                }
            },
            error: function(response)
            {
                console.log(response);
            }

        }
    )
}