$(document).ready(() => {
    getData();
    $(document).on('click', '.delete', function(){ 
        $.post('/api/courses/delete', {token: getCookie('auth_token'), id: this.id})
        .done((data) => {
            if(data.error) {
                $("#snacc").attr("data-content", data.error.message);
                $("#snacc").snackbar("show");
                return;
            }
            getData();
        })
        .fail(() => {
            $("#snacc").attr("data-content",'Could not contact servers.');
            $("#snacc").snackbar("show");
        });
    });
});

function getData() {
    $.post('/api/courses', {token: getCookie('auth_token')})
    .done((data) => {
        renderData(data);
        $('body').bootstrapMaterialDesign();
    });
}
function renderData(data) {
    document.getElementById('failure').innerHTML = '';
    let totalstr = '';
    let tempstr, failure = false;
    let doubleArr = [];
    if(data.courses.length == 0) totalstr = `
        <p class="noCourse">No courses!</p>
    `
    if(data.courses.length > 0 && data.courses.length % 2 != 0) {
        tempstr = `
        <div class="row">
            <div class="card col-md-5">
                <div class="card-body">
                    <strong>Course: </strong>
                    <p>${data.courses[(data.courses.length - 1)].name}</p><br>
                    <button id="${data.courses[(data.courses.length - 1)]._id}" class="delete btn btn-raised btn-danger">Delete</button>
                </div>
            </div>
        </div><br>
        `
        data.courses.pop();
    }
    if(data.courses.length > 0) {
        data.courses.forEach((val) => {
            doubleArr.push(val);
            if(doubleArr.length > 1) {
                totalstr += `
                <div class="row">
                    <div class="card col-md-5">
                        <div class="card-body">
                            <strong>Course: </strong>
                            <p>${doubleArr[0].name}</p><br>
                            <button id="${doubleArr[0]._id}" class="delete btn btn-raised btn-danger">Delete</button>
                        </div>
                    </div>
                    <div class="card col-md-5">
                        <div class="card-body">
                            <strong>Course: </strong>
                            <p>${doubleArr[1].name}</p><br>
                            <button id="${doubleArr[1]._id}" class="delete btn btn-raised btn-danger">Delete</button>
                        </div>
                    </div>
                </div><br>
                `
                doubleArr = [];
            }
        });
    }
    if(tempstr) totalstr += tempstr;
    document.getElementById('failure').innerHTML = totalstr;
}