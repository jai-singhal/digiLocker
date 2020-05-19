var web3 = new Web3(window.web3.currentProvider);
var address = window.web3.currentProvider.selectedAddress;
var contract = new web3.eth.Contract(abi, contractAddress, {
    from: address,
    gasLimit: 3000000,
});
$(document).ready(function () {

    contract.methods.getDocCountByUserId().call().then(function (obj) {
        $("#total_doc").val(obj);
    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching document count : " + error,
            icon: "error",
            allowOutsideClick: false,
            closeOnClickOutside: false,
        });

    });
    checkAlreadyRegiteredUser();
    $("#main-loader").hide();
})



$('#id_upload_doc').submit(function (event) {
    event.preventDefault();
    $("#main-loader").show();

    var master_key = $("#master_key").val();
    var total_doc = $("#total_doc").val();

    var _this = $(this);
    contract.methods.getUseraccessKey().call().then(function (mkeyHash) {
        var request = new XMLHttpRequest();

        let accesskey_url = "/api/user/accesskey";
        request.open('POST', accesskey_url, true);
        request.onload = function () {

            if (request.status == 200) {
                var resp = JSON.parse(request.responseText);
                if (resp.valid == false) {
                    swal({
                        title: "Warning!",
                        text: "Master key is not valid!!",
                        icon: "warning",
                        allowOutsideClick: false,
                        closeOnClickOutside: false,
                    });
                    return false;
                } else {
                    var key = resp.ekey;
                    var fileInput = document.getElementById('file');
                    var file = fileInput.files[0]
                    console.log(file.size, "file size", file,file.name, file.size / 1000000)
                    var fileName = file.name;
                    fileName = fileName.split(".").pop();
                    if( ['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', "docx"].includes(fileName))
                    {
                        console.log("Valid Extension-"+fileName);
                        
                    }
                    else
                    {
                        console.log("not matched")
                        $("#main-loader").hide();
                        swal({
                            title: "Warning!",
                            text: "Invalid file extension!!",
                            icon: "warning",
                            allowOutsideClick: false,
                            closeOnClickOutside: false,
                        });
                       
                    }
                
                    if (Math.floor(file.size / 1000000) <= 5) {
                        // Read file callback!
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var encrypted = CryptoJS.AES.encrypt(e.target.result, key, {
                                iv: address,
                                padding: CryptoJS.pad.Pkcs7,
                                mode: CryptoJS.mode.CBC
                            }).toString()

                            var encryptedFile = new File([encrypted], file.name, {
                                type: file.type,
                                lastModified: file.lastModified
                            });

                            var data = new FormData();
                            data.append('file', encryptedFile);
                            data.append("X-CSRFToken", getCookie('csrftoken'));
                            data.append("total_doc", total_doc);

                            $.ajax({
                                url: '/post/api/upload/doc',
                                data: data,
                                cache: false,
                                contentType: false,
                                processData: false,
                                type: 'POST',

                                beforeSend: function () {
                                    $("#main-loader").show();
                                },

                                success: function (res) {
                                    if (res.success == true) {
                                        $("#main-loader").hide();

                                        var docHash = res.docHash;
                                        var docId = res.docId;
                                        // console.log(docHash, docId)
                                        var timestamp = new Date().toLocaleString();

                                        contract.methods.checkAlreadyUpload(docId).call().then(function (obj) {
                                            if (obj == true) {
                                                alert("This document is already uploaded!!")
                                                return false;
                                            } else {
                                                contract.methods.uploadDocument(file.name.trim(), docId, docHash, timestamp).send().then(function (obj) {
                                                    swal({
                                                        title: "Success!",
                                                        text: "Document Uploaded Successfully",
                                                        icon: "success",
                                                        allowOutsideClick: false,
                                                        closeOnClickOutside: false,
                                                    }).then((value) => {
                                                        if (value)
                                                            window.location.replace(res.redirect_url);
                                                    })
                                                }).catch(function(error)
                                                {
                                                    swal({
                                                        title: "Error!",
                                                        text: "Error while executing contract uploadDocument() : "+error.message,
                                                        icon: "error",
                                                        allowOutsideClick: false,
                                                        closeOnClickOutside: false,
                                                    })


                                                });
                                            }
                                        });
                                    } else {
                                        $("#main-loader").hide();
                                        swal({
                                            title: "Something went wrong!",
                                            text: res["error"],
                                            icon: "error",
                                            allowOutsideClick: false,
                                            closeOnClickOutside: false,
                                        });
                                    }
                                },
                                error: function (res) {
                                    alert(res, "error")
                                }
                            });

                            //     }
                            // })

                        } // end reader onload
                        reader.readAsDataURL(file);
                    } // end if
                    else {
                        $("#main-loader").hide();
                        swal({
                            title: "Something went wrong!",
                            text: "Upload size limits to 5MB",
                            icon: "error",
                            allowOutsideClick: false,
                            closeOnClickOutside: false,
                        });
                    }
                }
            } else {
                var resp = JSON.parse(request.responseText);
                alert("Request failed" + resp.error)
                $("#main-loader").hide();
            }
        };
        request.onerror = function () {
            swal({
                title: "Alert!",
                text: "Error while uploading!!",
                icon: "error",
                allowOutsideClick: false,
                closeOnClickOutside: false,
            });

        };
        var formData = 'master_key=' + master_key + "&mkeydigest=" + mkeyHash + "&total_doc=" + total_doc;
        formData += "&upload=" + '1';
        // console.log(formData)
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        request.send(formData);
        $("#main-loader").hide();
    });

})