var web3 = new Web3(window.web3.currentProvider);
var address = $("#registration").attr("address");
var contract = new web3.eth.Contract(abi, contractAddress, {
    from: address,
    gasLimit: 3000000,
});

$(document).ready(function(){
    contract.methods.isalreadyRegisteredUser().call().then(function(obj){
        if(obj == true){
            window.location.replace("/dashboard");
        }
    });

})


$("#registration").submit(function(e){
    e.preventDefault();
    var fname = $("#first_name").val()
    var lname = $("#last_name").val()
    var email = $("#email").val()
    var cno = $("#contact_no").val()
    
    contract.methods.registerUser(fname, lname, email, 1, cno).send(function(){
        var request = new XMLHttpRequest();
        var register_url = "/api/register/metamask";
        request.open('POST', register_url, true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                var resp = JSON.parse(request.responseText);
                if (resp.success){
                    window.location.replace(resp.redirect_url);
                }
            } else {
                alert("Error in sending mail")
            }
        };

        request.onerror = function () {
            console.log("login failed - there was an error");
        };
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        
        // this one
        var formData = 'first_name=' + fname + '&last_name=' + lname + "&email=" + email + "&contact_no=" + cno;
        request.send(formData);

    });
})
