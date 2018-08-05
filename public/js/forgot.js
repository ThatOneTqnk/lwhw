let failure = false;
window.onbeforeunload = function() {
    if(!failure) return true;
};

function renderPart(part) {
    document.getElementById('content').style.display = 'none';
    document.getElementById('content2').style.display = 'none';
    document.getElementById('content3').style.display = 'none';

    document.getElementById(part).style.display = 'inline';
}

$(document).ready(() => {
    $('form').submit(function(e){
        return false;
    });
    $('#sendCode').click(async () =>{
        let response;
        try {
            response = await reqForgotCode($('#putEmail').val());
        } catch(e) {
            response = e;
        }
        if(response.error) {
            if(response.error == -1) {
                $("#snacc").attr("data-content",'An error occurred. Try again.');
            } else if(response.error == 101) {
                $("#snacc").attr("data-content",'Please fill out the field.');
            } else if(response.error == 1) {
                $("#snacc").attr("data-content", 'Please enter a valid email address.');
            }
            $("#snacc").snackbar("show");
        } else {
            document.getElementById('emailInsert').innerHTML = $('#putEmail').val().toLowerCase();
            renderPart('content2');
            console.log('lol debugger');
        }
    });
    $('#tryCode').click(async () => {
        let candidCode = $('#putCode').val();
        if(!(candidCode) || candidCode.length > 5) {
            $("#snacc").attr("data-content", 'Invalid code.');
            $("#snacc").snackbar("show");
            return;
        }
        if($('#putPass').val() != $('#putPassC').val()) {
            $("#snacc").attr("data-content", 'Passwords do not match.');
            $("#snacc").snackbar("show");
            return;
        }
        let response;
        try {
            response = await tryRecover(candidCode, $('#putPass').val(), $('#putPassC').val(), $('#putEmail').val().toLowerCase());
        } catch(e) {
            response = e;
        }
        if(response.error) {
            if(response.error == -1) {
                $("#snacc").attr("data-content",'An error occurred. Try again.');
            } else if(response.error == 101) {
                $("#snacc").attr("data-content",'Please fill out the field.');
            } else if(response.error == 1) {
                $("#snacc").attr("data-content", 'Code was incorrect.');
            } else if(response.error == 3) {
                $("#snacc").attr("data-content", 'E-mail was invalid.');
            } else if(response.error == 2) {
                $("#snacc").attr("data-content", 'Passwords do not match.');
            }
            $("#snacc").snackbar("show");
        } else {
            failure = true;
            renderPart('content3');
        }
    });
});