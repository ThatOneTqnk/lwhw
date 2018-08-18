$(document).ready(() => {
    $.post('/api/courses', {token: getCookie('auth_token')})
    .done((data) => {
        let totalstr = '';
        data.courses.forEach((val) => {
            totalstr += `<div class="card col-md-6"><div class="card-body"><strong>Course: </strong><p>${val.name}</p></div></div><br>`
        });
        document.getElementById('load').style.display = 'none';
        document.getElementById('courses').innerHTML = totalstr;
    });
});