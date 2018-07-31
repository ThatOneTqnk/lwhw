$(document).ready(() => {
    document.querySelector('form').addEventListener('submit', processLogin);
    async function processLogin(e) {
        e.preventDefault();
        let data;
        try {
            data = await isAuth($('#uname').val(), $('#psw').val());
        } catch(e) {
            data = e;
        }
        if(data.error) {
            if(data.error == 101) {
                snacc('Error in contacting servers.')
            } else if(data.error == 1) {
                snacc('Invalid combination.');
            }
        }
        if(data.token) {
            authMe(data.token);
            if(data.activated) {
                window.location.replace("/dashboard/");
            } else {
                window.location.replace("/dashboard/activate");
            }
        }
    }
});