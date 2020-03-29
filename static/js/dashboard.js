
var web3 = new Web3(window.web3.currentProvider);

$("#logout-btn").click(function (e) {
    e.preventDefault();
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
});

$("#btn btn-primary").click(function(e){

   var file_data = $("#file").value()
   //Can fetch filename
   
}


)


$(document).ready(function(){
    var from = $("#account-address").html()
    web3.eth.getBalance(from, (err, balance) => {
        balance = web3.utils.fromWei(balance, "ether");
        $("#funds").html(balance)
    });



    $("div#upload_files").dropzone({ url: "/api/upload/file" });
})

