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