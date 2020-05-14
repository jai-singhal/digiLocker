
function checkRegiterededUser(){
    getContract();
    contract.methods.isalreadyRegisteredUser().call().then(function(obj){
        if(obj == true){
            window.location.replace("/dashboard");
        }        
    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while checking user is regitred or not" + error,
            icon: "error",
        });
   });
}

$(document).ready(function(){
    $("#main-loader").hide();
    $('.collapsible').collapsible();
    $("#dash_btn a").removeAttr("href");
    checkRegiterededUser();
})

$("#resident_registration").submit(function(e){
    e.preventDefault();
    var fname = $("#first_name").val()
    var lname = $("#last_name").val()
    var email = $("#email").val()
    var confirm_email = $("#confirm_email").val()

    var cno = $("#contact_no").val()
    var mkey = $("#master_key").val()
    var mkey_c = $("#master_key_confirm").val()

    if(mkey != mkey_c){
        swal({
            title: "Warning!",
            text: "Enter master key correctly.",
            icon: "warning",
        });
        return false;
    }

    if(email != confirm_email){
        swal({
            title: "Warning!",
            text: "Enter email correctly.",
            icon: "warning",
        });
        return false;
    }

    var request = new XMLHttpRequest();
    var register_url = "/api/user/registration/";
    request.open('POST', register_url, true);
    request.onload = function () {
        if (request.status == 200) {
            // Success!
            var resp = JSON.parse(request.responseText);
            if (resp.success){
                let access_key = "0x" + resp.master_key_hash;
                let pu = "";
                let utype = 1
                // calling registerUser method
                // TODO: error resolution: use try catch
                var r = contract.methods.registerUser(
                    fname, lname, email, utype, cno, 
                    access_key, pu
                ).send().then(function(res){
                    // console.log("xx", err, res)
                    window.location.replace(resp.redirect_url);
                    swal({
                        title: "Success!",
                        text: "Registration Successful!! You will recieve credentials via mail.",
                        icon: "success",
                    });
                });
            }
        } else {
            alert("Error in sending mail")
        }
    };

    request.onerror = function () {
        console.log("Registration failed - there was an error");
    };
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    
    // TODO: send the key with encryption
    var formData = 'first_name=' + fname + '&last_name=' + lname + "&utype=" + "1";
    formData += "&email=" + email + "&contact_no=" + cno + "&master_key=" + mkey;
    formData += "&user_address=" + address;
    request.send(formData);

})


$("#requestor_registration").submit(function(e){
    e.preventDefault();
    var fname = $("#org_name").val()
    var lname = "";
    var email = $("#org_email").val()
    var confirm_email = $("#confirm_org_email").val()

    var cno = $("#org_contact_no").val()

    if(email != confirm_email){
        swal({
            title: "Warning!",
            text: "Enter email correctly.",
            icon: "warning",
        });
        return false;
    }

    var request = new XMLHttpRequest();
    var register_url = "/api/user/registration/";
    request.open('POST', register_url, true);
    request.onload = function () {
        if (request.status == 200) {
            // Success!
            var resp = JSON.parse(request.responseText);
            console.log(resp)
            if (resp.success){
                var access_key = "0x0000000000000000000000000000000000000000"
                var utype = 2;
                var r = contract.methods.registerUser(
                    fname, lname, email, utype, cno, 
                    access_key, resp.pu
                ).send().then(function(res){
                    window.location.replace(resp.redirect_url);
                    swal({
                        title: "Success!",
                        text: "Registration Successful!! You will recieve credentials via mail.",
                        icon: "success",
                    });
                });
            }
        } else {
            alert("Error in sending mail")
        }
    };

    request.onerror = function () {
        console.log("Registration failed - there was an error");
    };
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    
    // TODO: send the key with encryption
    var formData = 'first_name=' + fname;
    formData += "&email=" + email + "&contact_no=" + cno + "&utype=" + "2";
    formData += "&user_address=" + address;
    request.send(formData);

})


