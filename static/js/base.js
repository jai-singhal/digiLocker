var contractAddress = "0xc0b9c71d5c79583B590491fA9109073461C34286"

var web3 = new Web3(window.web3.currentProvider);
var contract = null;
var address = null;
/**
 * TODO: 
 */
$(document).ready(function(){
    // check the account change
    getContact();

    window.ethereum.on('accountsChanged', function (accounts) {
        swal("The account change is observed. Reload?")
        .then((value) => {
            location.reload();
        });
    })
})

function getContact(){
    let addr__ = sessionStorage.getItem('address');
    if(!addr__)
        address = window.web3.currentProvider.selectedAddress;
    else
        address = addr__
    // if(address === undefined || !address.){
    //     if(window.location.pathname !== "/"){
    //         // logout()
    //     }
    // }
    // else{
    //     address = address.selectedAddress;
    // }
    console.log(address)

    let contr__ = JSON.parse(sessionStorage.getItem('contract'));

    if(!contr__){
        contract = new web3.eth.Contract(abi, contractAddress, {
            from: address,
            gasLimit: 3000000,
        });
    }
    else
        contract = contr__;

    return contract;
}


if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

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

function checkWeb3(callback) {
    window.web3.eth.getAccounts(function (err, accounts) { // Check for wallet being locked
        if (err) {
            throw err;
        }
        callback(accounts.length !== 0);
    });
}


function logout(){
    var request = new XMLHttpRequest();
    let logout_url = "/api/logout/metamask";
    request.open('GET', logout_url, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var resp = JSON.parse(request.responseText);
            sessionStorage.clear();
            window.location.replace(resp.redirect_url);
        }
        else{
            alert("Logout failed")
        }
    };
    request.onerror = function () {
        alert("Logout failed");
    };
    request.send();
}

$("#logout-btn").click(function (e) {
    e.preventDefault();
    logout();
});

