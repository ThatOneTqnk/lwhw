$(document).ready(() => {
    $.post('/api/assignments', {token: getCookie('auth_token')})
    .done((data) => {
        console.log(data);
        let totalstr = '';
        data.assignments.forEach((val) => {
            totalstr += `<div class="card col-md-6"><div class="card-body"><strong>Assignment: </strong><p>${val.title}</p></div></div><br>`
        });
        document.getElementById('load').style.display = 'none';
        document.getElementById('hws').innerHTML = totalstr;
    });
});