// import { verifyCode } from "../../util/bcrypt";
$(document).ready(() => {
    $("#activation").submit(function(e){
        return false;
    });
    $('#activater').click(()=>{processActivate();});
    async function processActivate() {
        let code = $('#activate').val();
        let result;
        try {
            result = await verifyCode(code);
        } catch(e) {
            result = e;
        }
        if(result.response) {
            window.location.replace("/dashboard/");
        } else {
            if(result.error == 101) {
                $("#snacc").attr("data-content",'Error in contacting servers.')
            } else if(result.error == 3) {
                $("#snacc").attr("data-content",'Incorrect E-mail code.')
            } else if(result.error == 2) {
                $("#snacc").attr("data-content",'Session expired. Relog.')
            } else if(result.error == -1) {
                $("#snacc").attr("data-content",'Please enter a code.')
            }
            $("#snacc").snackbar("show");
        }
    };
});