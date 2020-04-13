
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
                            <div class="card" style = "margin: 40px">
                                <div class="card-body">
                                    <h4 class="card-title">`+album.Album+ `</h4>
                                    <h5 class="text-muted card-subtitle mb-2">`+album.Artist+`</h6>
                                    <h6 class="text-muted card-subtitle mb-2">`+album.Year+`</h6>
                                    <h6 class="text-muted card-subtitle mb-2">`+album.Genre+`</h6>
                                    <button class="btn btn-primary" type="button" style="margin: 19px;">Favourite</button></div>
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

        /*
        event.preventDefault();
        $('#mainCard').html('');

        var searchTerm = $('#search');

       */
    })

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
                    <div class="card" style = "margin: 40px">
                        <div class="card-body">
                            <h4 class="card-title">`+album.Album+ `</h4>
                            <h5 class="text-muted card-subtitle mb-2">`+album.Artist+`</h6>
                            <h6 class="text-muted card-subtitle mb-2">`+album.Year+`</h6>
                            <h6 class="text-muted card-subtitle mb-2">`+album.Genre+`</h6>
                            <button class="btn btn-primary" type="button" style="margin: 19px;">Favourite</button></div>
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