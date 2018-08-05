function authMe(token) {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    document.cookie = `auth_token=${token}`
}



function register(email, user, pass, passC, devC) {
    return new Promise((resolve, reject) => {
        $.post("/register", {email: email, username: user, password: pass, passwordConf: passC, devCode: devC})
        .done((data) => {
            if(data.error) {
                reject({error: data.error});
            }
            if(data.token) {
                resolve({token: data.token});
            }
        })
        .fail(() => {
            reject({error: 101});
        });
    });
}


function isAuth(username, pass) {
    return new Promise((resolve, reject) => {
        $.post("/ghost_login", {user: username, pass: pass})
        .done((data) => {
            if(data.error) {
                reject({error: data.error});
            }
            if(data.token) {
                resolve({token: data.token, activated: data.activated});
            }
        })
        .fail(() => {
            reject({error: 101}); 
        });
    });
}

function showPasswords() {
    var x = document.getElementsByClassName("showPass");
    var arr = [].slice.call(x);
    arr.forEach((val) => {
        if(val.type === "password") {
            val.type = "text";
        } else {
            val.type = "password"
        }
    });
}


function tryResend(auth) {
    return new Promise((resolve, reject) => {
        $.post("/resend", {token: auth})
        .done((data) => {
            if(data.error) {
                reject({error: data.error});
            }
            if(data.good) {
                resolve({good: true});
            }
        })
        .fail(() => {
            reject({error: -1}); 
        });
    });
}

function tryRecover(candidateCode, cPass, cPassC, cEmail) {
    return new Promise((resolve, reject) => {
        $.post("/forgot/recover", {code: candidateCode, pass: cPass, cpass: cPassC, email: cEmail})
        .done((data) => {
            if(data.error) {
                reject({error: data.error});
            } else {
                resolve({token: data.token});
            }
        })
        .fail(() => {
            reject({error: -1});
        });
    });
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function logout() {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    window.location.replace("/");
}

function verifyCode(candidateCode) {
    return new Promise((resolve, reject) => {
        $.post("/verify", {code: candidateCode})
        .done((data) => {
            if(data.error) {
                reject({response: false, error: data.error});
            }
            if(data.good) {
                resolve({response: true});
            }
        })
        .fail(() => {
            reject({response: false, error: 101});
        });
    });
}

function reqForgotCode(candidateEmail) {
    return new Promise((resolve, reject) => {
        $.post('/forgot', {email: candidateEmail})
        .done((data) => {
            if(data.error) {
                reject({error: data.error});
            } else {
                resolve({good: true});
            }
        })
        .fail(() => {
            reject({error: 101});
        });
    });
}