// import { verifyCode } from "../../util/bcrypt";
$(document).ready(() => {
    $('#checkCode').click(async () => {
        let code = $('#activate').val();
        let result;
        try {
            result = await verifyCode(code);
        } catch(e) {
            result = e;
        }
        if(result.response) {
            snacc('All good boy. Verification, complete.');
        } else {
            if(result.error == 101) {
                snacc('Error in contacting servers.')
            } else if(result.error == 3) {
                snacc('Incorrect E-mail code.')
            } else if(result.error == 2) {
                snacc('Session expired. Relog.')
            } else if(result.error == 1) {
                snacc('Please enter a code.')
            }
        }
    });
});