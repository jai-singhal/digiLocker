var contractAddress = "0x2a04c6E8123a065B35c5b722da1285b1A9F7349F"

var web3 = new Web3(window.web3.currentProvider);
var contract = null;
var address = null;

function stateChange () {
    address = window.web3.currentProvider;
    console.log("Try again")
    if (!address.selectedAddress) {
        window.location.reload();
        setTimeout(stateChange, 700); // try again in 300 milliseconds
    }
  }
  
function getContract(){
    if(!contract){
        address = window.web3.currentProvider;
        if(!address.selectedAddress && window.location.pathname !== "/")
            stateChange()
        address = address.selectedAddress;
        console.log(address, "final")
        contract = new web3.eth.Contract(abi, contractAddress, {
            from: address,
            gasLimit: 3000000,
        });
    }
    return contract;
}

setInterval(function() {
    window.ethereum.on('accountsChanged', function (accounts) {
        swal("The account change is observed. Reload?")
        .then((value) => {
            if(value){
                logout();
            }
        });
    })
  }, 100);


/**
 * TODO: 
 */
$(document).ready(function(){
    address = window.web3.currentProvider;
    console.log(address)
    address = address.selectedAddress;
    getContract();
})



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


function checkAlreadyRegiteredUser(){
    contract = getContract()
    contract.methods.isalreadyRegisteredUser().call().then(function(obj){
        if(obj == false){
            swal({
                title: "Alert!",
                text: "User is not registered!!. Redirecting to home page.",
                icon: "warning",
            })
            .then((value) => {
                logout();
            });
        }
    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while checking user is regitred or not" + error,
            icon: "error",
        });
   });
}
