$(document).ready(() => {
    $("#logger").submit(function(e){
        return false;
    });
    $('#sendData').click(()=>{processLogin();});
    async function processLogin() {
        let data;
        try {
            data = await isAuth($('#uname').val(), $('#psw').val());
        } catch(e) {
            data = e;
        }
        if(data.error) {
            if(data.error == 101) {
                $("#snacc").attr("data-content",'Error in contacting servers.');
            } else if(data.error == 1) {
                $("#snacc").attr("data-content",'Incorrect email/username or password.');
            } else if(data.error == -1) {
                $("#snacc").attr("data-content",'Please fill out all fields.');
            }
            $("#snacc").snackbar("show");
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