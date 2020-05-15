function getPublicKey(){

  
    var requester_address = document.getElementById("_reqaddress").innerHTML;
    var owner_address = document.getElementById("_owneraddress").innerHTML;
    var doc_id = document.getElementById("_docid").innerHTML;
    var req_pub_key ="";
    var req_full_name ="";
    var req_email = "";
    var owner_name="";
    var owner_email="";
    var doc_name ="";
    console.log(requester_address)

    contract.methods.getOwnerDocInfoByDocId(doc_id).call().then(function(details){
        console.log(details)
        doc_name = details[0];
    
             contract.methods.getEmailIdByUsrAddr(owner_address).call().then(function(own){
                console.log(own)
                owner_name = own[1]+" "+own[2];
                owner_email = own[0];
            
             contract.methods.getPublicKey(requester_address).call().then(function(key) {
                console.log(key)
                req_pub_key = key;
           
                //Fetching details of requester such as name email and address(we already have)
             contract.methods.getEmailIdByUsrAddr(requester_address).call().then(function(req){
                console.log(req)
                req_full_name = req[1]+" "+req[2];
                req_email = req[0];
                
                $(document).on('click', '.btn', function() { 
                    sendRequestMailAjax(req_email,req_full_name,requester_address,
                        owner_name,owner_address,owner_email,doc_id,doc_name,req_pub_key)
                    });

               });
               
            });
        
        });
        
    });
    
}

function sendRequestMailAjax(req_email,req_full_name,requester_address,
    owner_name,owner_address,owner_email,doc_id,doc_name,req_pub_key){

    var data = {
        "doc_id": doc_id,
        "doc_name": doc_name,
        "req_email": req_email,
        "req_full_name": req_full_name,
        "requester_address": requester_address,
        "owner_address": owner_address,
        "owner_email": owner_email,
        "req_pub_key ": req_pub_key, 
        "master_key": "asd",
    }
    console.log(data)

    var request = new XMLHttpRequest();
    request.open('POST',"/post/api/send/aproove/mail",true);

    request.onload = function(){
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var resp = JSON.parse(request.responseText);
            if (resp.success){
                swal({
                    title: "Success!",
                    text: "Request Mail is sent to the owner",
                    icon: "success",
                  });
                window.location.replace("/dashboard");
            }
        } else {
            swal({
                title: "Error!",
                text: "Error",
                icon: "error",
            });
        }
    };

    request.onerror = function(){
        console.log("Error")
    };

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
      
    var formData = "";

    for(var key in data){
        if(data.hasOwnProperty(key)){
          formData += `${key}=${data[key]}&`  
        }
    }
    console.log(formData)
    request.send(formData);

}

// Checking logged -in user
function checkLoggedInUser(){

    var owner_address = document.getElementById("_owneraddress").innerHTML;
    contract.methods.getRegisteredUser().call().then(function(output){
    //console.log(owner_address)
    
    if(output[1]== owner_address)  
    {
        console.log(" Allow user - to approve")
    }
    else
    {
        console.log("Invalid User")
        window.location.replace("/dashboard");
    }

    });

}


$(document).ready(function() {

    checkLoggedInUser();    
    getPublicKey();
    $("#main-loader").hide();
   
})