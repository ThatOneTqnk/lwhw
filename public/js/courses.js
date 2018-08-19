$(document).ready(() => {
    $.post('/api/courses', {token: getCookie('auth_token')})
    .done((data) => {
        renderData(data);
        $('body').bootstrapMaterialDesign();
    });

    $(document).on('click', '.delete', function(){ 
        $.post('/api/courses/delete', {token: getCookie('auth_token'), id: this.id})
        .done((data) => {

        });
    });
});

function renderData(data) {
    document.getElementById('failure').innerHTML = '';
    let totalstr = '';
    let doubleArr = [];
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
    document.getElementById('failure').innerHTML = totalstr;
}