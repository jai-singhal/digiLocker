var web3 ;

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function loginWithSignature(address, signature, balance, login_url, onLoginRequestError, onLoginFail, onLoginSuccess) {
    console.log(address, signature, login_url)
    var request = new XMLHttpRequest();
    request.open('POST', login_url, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var resp = JSON.parse(request.responseText);
            if (resp.success) {
                if (typeof onLoginSuccess == 'function') {
                    onLoginSuccess(resp);
                    console.log("Logined");
                    //display the address and balance
                    
                    $("#account-address").html("Your account address is: " + from);
                    $("#funds").html("Your current balance is: " + balance + " ETH");

                    $("#auth-btn a").html("Logout");
                    $("#auth-btn").attr("btn-for", "logout");
                    $("#auth-btn a").attr("href", "/api/logout/metamask");
                }
            } else {
                if (typeof onLoginFail == 'function') {
                    onLoginFail(resp);
                }
            }
        } else {
            // We reached our target server, but it returned an error
            alert("Login failed - request status " + request.status);
            if (typeof onLoginRequestError == 'function') {
                onLoginRequestError(request);
            }
        }
    };

    request.onerror = function () {
        console.log("login failed - there was an error");
        if (typeof onLoginRequestError == 'function') {
            onLoginRequestError(request);
        }
        // There was a connection error of some sort
    };
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    var formData = 'address=' + address + '&signature=' + signature;
    request.send(formData);
}

function checkWeb3(callback) {
    web3.eth.getAccounts(function (err, accounts) { // Check for wallet being locked
        if (err) {
            throw err;
        }
        callback(accounts.length !== 0);
    });
}

function web3Login(login_url, onTokenRequestFail, onTokenSignFail, onTokenSignSuccess, // used in this function
    onLoginRequestError, onLoginFail, onLoginSuccess) {
    // used in loginWithSignature

    // 1. Retrieve arbitrary login token from server
    // 2. Sign it using web3
    // 3. Send signed message & your eth address to server
    // 4. If server validates that you signature is valid
    // 4.1 The user with an according eth address is found - you are logged in
    // 4.2 The user with an according eth address is NOT found - you are redirected to signup page

    if (typeof web3 === 'undefined') {
        alert('MetaMask is not installed');
        return false;
    }

    var request = new XMLHttpRequest();
    request.open('GET', login_url, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var resp = JSON.parse(request.responseText);
            var token = resp.data;
            var msg = web3.utils.toHex(token);

            web3.eth.getAccounts(function (err, accounts) {
                if (err != null) {
                    console.log(err);
                    return false;
                } else if (accounts.length === 0) {
                    alert('MetaMask is locked');
                    return false;
                } else {
                    var from = accounts[0]
                    console.log("token: ", msg);
                    console.log("from: ", from)

                    web3.eth.getBalance(from, (err, balance) => {
                        balance = web3.utils.fromWei(balance, "ether")
                        if (balance == 0) {
                            alert("Insufficient funds in your account. Total balance = 0 ETH");
                            return false;
                        } else {
                            web3.eth.personal.sign(msg, from, function (err, result) {
                                if (err) {
                                    if (typeof onTokenSignFail == 'function') {
                                        alert(err.message);
                                        onTokenSignFail(err);
                                    }
                                    alert("Failed signing message \n" + msg + "\n - " + err);
                                } else {
                                    console.log("Signed message: " + result);
                                    if (typeof onTokenSignSuccess == 'function') {
                                        onTokenSignSuccess(result);
                                    }
                                    loginWithSignature(from, result, balance, login_url, onLoginRequestError, onLoginFail, onLoginSuccess);
                                }
                            });

                        }
                    });

                }
            });


        } else {
            // We reached our target server, but it returned an error
            alert("Login failed - request status " + request.status);
            if (typeof onTokenRequestFail == 'function') {
                onTokenRequestFail(request);
                alert(request.status)
            }
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
        alert("Login failed - there was an error");
        if (typeof onTokenRequestFail == 'function') {
            onTokenRequestFail(request);
        }
    };
    request.send();
}



$("#auth-btn").click(function (e) {
    if(! window.web3){
        alert("Please install metamask");
        return false;
    }
    web3 = new Web3(window.web3.currentProvider);
    e.preventDefault();

    if($(this).attr("btn-for") === "logout"){
        console.log("Logout");
        $("#account-address").html("");
        $("#funds").html("");
        $("#auth-btn a").html("Login");
        $("#auth-btn").attr("btn-for", "login");
        $("#auth-btn a").attr("href", "/api/login/metamask");
        return false;
    }

    if (typeof web3 !== 'undefined') {
        checkWeb3(function (loggedIn) {
            if (!loggedIn) {
                alert("Please unlock/login to your web3 provider (probably, Metamask)")
            } else {
                var login_url = "/api/login/metamask";
                web3Login(login_url, console.log, console.log, console.log, console.log, console.log, function (resp) {
                    // window.location.replace(resp.redirect_url);
                });
            }
        });



    } else {
        alert('web3 missing');
    }

})