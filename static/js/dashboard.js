
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
                }
                else{


                    // function mainController($scope) {
  
                    //     var key = 'anything?';
                    //     var salt = CryptoJS.lib.WordArray.random(128/8);
                    //       var iv = CryptoJS.lib.WordArray.random(128/8);
                      
                    //     $scope.files = [];
                        
                    //     $scope.doUpload = function(element)
                    //     {
                    //         var file = element.files[0];
                    //         var reader = new FileReader();
                      
                    //         // Read file callback!
                    //         reader.onload = function (e) {
                          
                    //             var encrypted = CryptoJS.AES.encrypt(e.target.result, key, { iv: iv, 
                    //                 mode: CryptoJS.mode.CBC, 
                    //                 padding: CryptoJS.pad.Pkcs7 
                    //             });
                              
                    //             var encryptedFile = new File([encrypted], file.name + '.encrypted', {type: file.type, lastModified: file.lastModified});
                    //             console.log('encryptedFile', encryptedFile);
                      
                    //             //console.log('CryptoJS', CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8));
                    //         }
                            
                    //         reader.readAsDataURL(file);
                    //     }
                        
                    //   }

                    _this.unbind('submit').submit(); 
                }
            }
            else{
                alert("Request failed")
            }
        };
        request.onerror = function () {
            alert("Request failed");
        };

        
        

        var formData = 'master_key=' + master_key + "&mkeydigest=" + mkeyHash;
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        request.send(formData);

    });

    
})