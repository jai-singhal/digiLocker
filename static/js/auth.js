var web3 ;
function loginWithSignature(address, signature, balance, login_url, onLoginRequestError, onLoginFail, onLoginSuccess) {
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

    var contract = new web3.eth.Contract(abi, contractAddress, {
        from: address,
        gasLimit: 3000000,
    });

    contract.methods.isalreadyRegisteredUser().call().then(function(obj){
        var formData = 'address=' + address + '&signature=' + signature + "&newuser=" + obj;
        request.send(formData);
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
        swal('MetaMask is not installed');
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
                    swal('MetaMask is locked');
                    return false;
                } else {
                    var from = accounts[0]
                    console.log("token: ", msg);
                    console.log("from: ", from)

                    web3.eth.getBalance(from, (err, balance) => {
                        balance = web3.utils.fromWei(balance, "ether")
                        if (balance == 0) {
                            swal("Insufficient funds in your account. Total balance = 0 ETH");
                            return false;
                        } else {
                            web3.eth.personal.sign(msg, from, function (err, result) {
                                if (err) {
                                    if (typeof onTokenSignFail == 'function') {
                                        swal(err.message);
                                        onTokenSignFail(err);
                                    }
                                    // swal("Failed signing message \n" + msg + "\n - " + err);
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


function openInNewTab(url) {
    var win = window.open(url, '_blank');
    window.focus();
  }

$("#auth-btn").click(function (e) {
    if(! window.web3){
        swal("Please install metamask. You will be redirected to Metamask");
        openInNewTab("https://metamask.io/");
        return false;
    }
    e.preventDefault();

    if (typeof web3 !== 'undefined') {
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum);
            try {
                // Request account access if needed
                ethereum.enable();
                // Acccounts now exposed
            } catch (error) {
                // User denied account access...
                alert(error);
                
            }
        }
        
        web3 = new Web3(window.web3.currentProvider);

        checkWeb3(function (loggedIn) {
            if (!loggedIn) {
                swal("Please unlock/login to your Metamask")
            }
            else{
                var login_url = "/api/login/metamask";
                web3Login(login_url, console.log, console.log, console.log, console.log, console.log, function (resp) {
                    window.location.replace(resp.redirect_url);
                });
            }
                
        });


    } else {
        swal('web3 missing');
    }


})

$(document).ready(function(){
    $("#main-loader").hide();
})