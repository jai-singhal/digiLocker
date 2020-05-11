function getPublicKey(){

    var requester_address = document.getElementById("_reqaddress").innerHTML;
    
    console.log(requester_address)
    var masterKey = document.getElementById("master_key").value;
    console.log(masterKey)
    contract.methods.getPublicKey(requester_address).call().then(function(key) {
        console.log(key)

    });
}






$(document).ready(function() {
    
    getPublicKey();
    $("#main-loader").hide();
   
})