
var web3 = new Web3(window.web3.currentProvider);
var address = window.web3.currentProvider.selectedAddress;
var contract = new web3.eth.Contract(abi, contractAddress, {
    from: address,
    gasLimit: 3000000,
});
$(document).ready(function(){
    contract.methods.getDocCountByUserId().call().then(function(obj){
        $("#total_doc").val(obj);
    });
    checkAlreadyRegiteredUser();
    $("#main-loader").hide();
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
                swal({
                    title: "Success!",
                    text: "Document Uploaded Successfully",
                    icon: "success",
                  }).then((value) => {
                        window.location.replace(res.redirect_url);
                });
            }
            else{
                swal({
                    title: "Something went wrong!",
                    text: res["error"],
                    icon: "error",
                  });
            }
            // document.getElementById('wait').innerHTML="File Upload Done";
            // document.getElementById('status').innerHTML="Send this in your email: " + data +"&password="+password;
        },
        error: function(res){
            console.log(res, "error")
        }
    });
}


$('#id_upload_doc').submit(function(event) {
    event.preventDefault(); 
    $("#main-loader").show();

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
                                else{
                                    var timestamp = new Date().toLocaleString();
                                    console.log(file.name.trim(), dochash, timestamp)
                                    contract.methods.uploadDocument(file.name.trim(), dochash, timestamp).send().then(function(obj){
                                        uploadDocument(encryptedFile, total_doc);
                                    })
                                }
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
            swal({
                title: "Alert!",
                text: "Error while uploading!!",
                icon: "error",
              });

        };
        var formData = 'master_key=' + master_key + "&mkeydigest=" + mkeyHash + "&total_doc=" + total_doc;
        // console.log(formData)
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        request.send(formData);
        $("#main-loader").hide();
    });
    
})
