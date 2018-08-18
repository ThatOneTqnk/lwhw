$(document).ready(() => {
    $('#addAssign').submit(() => {
        return false;
    });
    $('#sendData').click(async () => {
        let title = $('#atitle').val();
        let desc = $('#desc').val();
        let success;
        try {
            success = await createNote(title, desc);
        } catch(e) {
            success = e;
        }
        $("#snacc").snackbar("hide");
        if(success.err) {
            $("#snacc").attr("data-content", success.err);
        } else {
            $("#snacc").attr("data-content",'Saved assignment.');
        }
        $("#snacc").snackbar("show");
    });
});