
var web3 = new Web3(window.web3.currentProvider);
var address = $("#main_id").attr("user_address");
var contract = new web3.eth.Contract(abi, contractAddress, {
    from: address,
    gasLimit: 3000000,
});

function showBalance(){
    web3.eth.getBalance(address, (err, balance) => {
        console.log(err, balance)
        var mbalance = web3.utils.fromWei(balance, "ether");
        console.log(mbalance)
        $("#funds").html(mbalance)
    });
}

$(document).ready(function(){
    contract.methods.isalreadyRegisteredUser().call().then(function(obj){
        console.log(obj)
        if(obj == false){
            window.location.replace("/registration");
        }
    });

    
    contract.methods.getDocCountByUserId().call().then(function(obj){
        console.log(obj)
        $("#total_doc").val(obj);
    });
    // showBalance()
})


$('#id_upload_doc').submit(function(event) {

    event.preventDefault(); 
    var master_key = $("#master_key").val();
    var total_doc = $("#total_doc").val();

    var _this = $(this);
    contract.methods.getUseraccessKey().call().then(function(mkeyHash){
        var request = new XMLHttpRequest();
        
        let accesskey_url = "/api/user/accesskey";
        request.open('POST', accesskey_url, true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                var resp = JSON.parse(request.responseText);
                if(resp.valid == false){
                    alert("Master key is not valid")
                    return false;
                }
                else{
                    var key = resp.ekey;
                    var fileInput = document.getElementById('file');
                    var file = fileInput.files[0]

                    if(Math.floor(file.size/1000000) <= 5){
                        // Read file callback!
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var encrypted = CryptoJS.AES.encrypt(e.target.result, key,{ 
                                    iv: address, 
                                    padding: CryptoJS.pad.Pkcs7,
                                    mode: CryptoJS.mode.CBC
                            }).toString()

                            var encryptedFile = new File([encrypted], file.name, {type: file.type, lastModified: file.lastModified});
                            var dochash =  "0x" + CryptoJS.SHA256(e.target.result).toString();
                            
                            contract.methods.checkAlreadyUpload(dochash).call().then(function(obj){
                                if(obj == true)
                                    alert("This document is already uploaded!!")
                                else
                                    contract.methods.uploadDocument(file.name, dochash).send().then(function(obj){
                                        uploadDocument(encryptedFile, total_doc);
                                    })
                            })

                        } // end reader onload
                        reader.readAsDataURL(file);

                    } // end if
                    else{
                        alert("Upload size limits to 5MB");
                    }
                }
            }
            else{
                alert("Request failed")
            }
        };
        request.onerror = function () {
            alert("Request failed");
        };

    
        var formData = 'master_key=' + master_key + "&mkeydigest=" + mkeyHash + "&total_doc=" + total_doc;
        console.log(formData)
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        request.send(formData);

    });
    
})


function uploadDocument(encryptedFile, total_doc){
    var data = new FormData();
    data.append( 'file', encryptedFile );
    data.append("X-CSRFToken", getCookie('csrftoken'));
    data.append("total_doc", total_doc);
    
    $.ajax({
        url: '/post/api/upload/doc',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function (res) {
            if(res.success == true){
                window.location.replace(res.redirect_url);
            }
            else{
                alert(res["error"])
            }
            // document.getElementById('wait').innerHTML="File Upload Done";
            // document.getElementById('status').innerHTML="Send this in your email: " + data +"&password="+password;
        },
        error: function(res){
            console.log(res, "error")
        }
        });


}