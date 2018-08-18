$(document).ready(() => {
    $('#addCourse').submit(() => {
        return false;
    });
    $('#sendData').click(async () => {
        let course = $('#acourse').val();
        let color = $('#color').val();
        let success;
        try {
            success = await createCourse(course, color);
        } catch(e) {
            success = e;
        }
        $("#snacc").snackbar("hide");
        if(success.err) {
            $("#snacc").attr("data-content", success.err);
        } else {
            $("#snacc").attr("data-content",'Saved course.');
        }
        $("#snacc").snackbar("show");
    });
});