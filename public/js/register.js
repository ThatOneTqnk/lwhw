$(document).ready(() => {
    document.querySelector('form').addEventListener('submit', processRegister);

    async function processRegister(e) {
        e.preventDefault();
        let data;
        try {
            data = await register($('#user').val(), $('#username').val(), $('#pass').val(), $('#passConf').val(), $('#devCode').val());
        } catch(e) {
            data = e;
        }
        if(data.error) {
            if(data.error == 6) {
                snacc('Username not permitted.');
            } else if(data.error == 5) {
                snacc('Dev code is incorrect.');
            } else if(data.error == 4) {
                snacc('The e-mail is not valid.');
            } else if(data.error == 3) {
                snacc('The username is already taken.');
            } else if(data.error == 2) {
                snacc('The email has already been registered.');
            } else if(data.error == 1) {
                snacc('Passwords do not match!');
            } else if(data.error == 101) {
                snacc('Something went wrong. Please try again.');
            }
            return;
        }
        if(data.token) {
            authMe(data.token);
            window.location.replace("/dashboard/activate");
        }

    }

});