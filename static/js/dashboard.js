
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
                    var filename = document.getElementById('filename');
                    var fileInput = document.getElementById('file');
                    var file = fileInput.files[0]
                    if(file.size/1000000 <= 5){
                        var reader = new FileReader();
                        // Read file callback!
                        reader.onload = function (e) {
                            var encrypted = CryptoJS.AES.encrypt(e.target.result, key);
                            if(filename){
                                var fhash = CryptoJS.SHA1(address + filename);
                            }
                            else
                                var fhash = CryptoJS.SHA1(address + file.name);

                            var encryptedFile = new File([encrypted], fhash + '.encrypted', {type: file.type, lastModified: file.lastModified});
                            var dochash = "0x" + CryptoJS.SHA1(e.target.result);

                            contract.methods.uploadDocument(dochash).send().then(function(obj){
                                console.log(obj)
                                if(obj == false){
                                    window.location.replace("/registration");
                                }
                            });
                            console.log('encryptedFile', encryptedFile);
                        }
                        reader.readAsDataURL(file);

                        // _this.unbind('submit').submit(); 
                    }
                    else{
                        alert("Upload size limits to 5MB");
                    }
                    console.log(resp, key, file)
                    console.log( _this, fileInput)
 
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