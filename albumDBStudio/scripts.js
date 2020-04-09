
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
                var signUpForm = $('#tbody');

                signUpForm.html('');

                signUpForm.append('Invalid User Credentials!');
            }
        })
    })
});