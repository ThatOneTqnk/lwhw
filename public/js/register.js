$(document).ready(() => {
    document.querySelector('form').addEventListener('submit', processLogin);
    function processLogin(e) {
        e.preventDefault();
        $.post("./register", {email: $('#user').val(), username:  $('#username').val(), password:  $('#pass').val(), passwordConf: $('#passConf').val(), devCode: $('#devCode').val()})
        .done((data) => {
            if(data.error) {
                if(data.error == 5) {
                    alert('Dev code is incorrect.');
                } else if(data.error == 4) {
                    alert('The e-mail is not valid.');
                } else if(data.error == 3) {
                    alert('The username is already taken.');
                } else if(data.error == 2) {
                    alert('The email has already been registered.');
                } else if(data.error == 1) {
                    alert('Passwords do not match!');
                } else if(data.error == 101) {
                    alert('Something went wrong. Please try again.');
                }
            }
            if(data.good) {
                window.location.replace("./login")
            }
        });
    }
});