var requester_address = document.getElementById("_reqaddress").innerHTML;
var owner_address = document.getElementById("_owneraddress").innerHTML;
var doc_id = document.getElementById("_docid").innerHTML;


function getPublicKey() {

    var req_pub_key = "";
    var req_full_name = "";
    var req_email = "";
    var owner_name = "";
    var owner_email = "";
    var doc_name = "";
    var hash = "";
    var total_doc = 1;
    var docIndex = -1;

    contract.methods.getOwnerDocInfoByDocId(doc_id).call().then(function (details) {
        doc_name = details[0];

        contract.methods.getEmailIdByUsrAddr(owner_address).call().then(function (own) {
            owner_name = own[1] + " " + own[2];
            owner_email = own[0];

            contract.methods.getDocIndex(doc_id, owner_address).call().then(function (index) {

                docIndex = index;

                contract.methods.getPublicKey(requester_address).call().then(function (key) {
                    req_pub_key = key;

                    //Fetching details of requester such as name email and address(we already have)
                    contract.methods.getEmailIdByUsrAddr(requester_address).call().then(function (req) {
                        req_full_name = req[1] + " " + req[2];
                        req_email = req[0];

                        $(document).on('click', '.btn', function () {

                            var masterKey = document.getElementById("master_key").value;

                            contract.methods.getUseraccessKey().call().then(function (mkeyhash) {
                                hash = mkeyhash;
                                var request = new XMLHttpRequest();

                                let accesskey_url = "/api/user/accesskey";
                                request.open('POST', accesskey_url, true);

                                request.onload = function () {

                                    if (request.status >= 200 && request.status < 400) {
                                        var resp = JSON.parse(request.responseText);
                                        if (resp.valid == false) {

                                            swal({
                                                title: "Warning!",
                                                text: "Master Key is not valid. Please enter correct master key",
                                                icon: "warning",
                                                allowOutsideClick: false,
                                                closeOnClickOutside: false,
                                            });

                                            return false;
                                        } else {
                                            swal({
                                                title: "Warning!",
                                                text: `Do you want to provide the approval of document 
                                                    ${doc_name} to  ${req_full_name}`,
                                                icon: "warning",
                                                allowOutsideClick: false,
                                                closeOnClickOutside: false,
                                            }).then((value) => {
                                                if (value) {
                                                    contract.methods.shareDocumentwithUser(doc_id, owner_address, 0, requester_address).send().then(function (res) {
                                                        console.log("Sharing info is updated")
                                                        if (res) {
                                                            sendRequestMailAjax(masterKey, req_email, req_full_name, requester_address,
                                                                owner_name, owner_address, owner_email, doc_id, doc_name, req_pub_key, docIndex);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        alert("Request failed")
                                    }
                                };
                                request.onerror = function () {
                                    swal({
                                        title: "Alert!",
                                        text: "Master key is not correct!!",
                                        icon: "error",
                                        allowOutsideClick: false,
                                        closeOnClickOutside: false,
                                    });
                                }

                                var formData = 'master_key=' + masterKey + "&mkeydigest=" + hash + "&total_doc=" + total_doc;
                                formData += "&upload=" + '0';
                                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                                request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                                request.send(formData);



                            }).catch(function (error) {
                                console.log(error)
                                swal({
                                    title: "Error!",
                                    text: "Error, while fetching hash key!!",
                                    icon: "error",
                                    allowOutsideClick: false,
                                    closeOnClickOutside: false,
                                });

                            });

                        }); //On click

                    }).catch(function (error) {
                        console.log(error)
                        swal({
                            title: "Error!",
                            text: "Error, while fetching details of the requester!!",
                            icon: "error",
                            allowOutsideClick: false,
                            closeOnClickOutside: false,
                        });

                    });
                }).catch(function (error) {
                    console.log(error)
                    swal({
                        title: "Error!",
                        text: "Error, while fetching public key of the requester!!",
                        icon: "error",
                        allowOutsideClick: false,
                        closeOnClickOutside: false,
                    });

                });
            }).catch(function (error) {
                console.log(error)
                swal({
                    title: "Error!",
                    text: "Error, while fetching index of the selected document!!",
                    icon: "error",
                    allowOutsideClick: false,
                    closeOnClickOutside: false,
                });

            });


        }).catch(function (error) {
            console.log(error)
            swal({
                title: "Error!",
                text: "Error, while fetching details of the owner!!",
                icon: "error",
                allowOutsideClick: false,
                closeOnClickOutside: false,
            });
        });

    }).catch(function (error) {
        console.log(error)
        swal({
            title: "Error!",
            text: "Error, while fetching details of the document owned by owner!!",
            icon: "error",
            allowOutsideClick: false,
            closeOnClickOutside: false,
        });

    });

}

function sendRequestMailAjax(masterKey, req_email, req_full_name, requester_address,
    owner_name, owner_address, owner_email, doc_id, doc_name, req_pub_key, docIndex) {

    var data = {
        "doc_id": doc_id,
        "doc_name": doc_name,
        "requester_email": req_email,
        "req_full_name": req_full_name,
        "requester_address": requester_address,
        "owner_address": owner_address,
        "owner_email": owner_email,
        "req_pub_key": req_pub_key,
        "master_key": masterKey,
        "owner_name": owner_name,
        "docIndex": docIndex,
    }

    var request = new XMLHttpRequest();
    request.open('POST', "/post/api/send/aproove/mail", true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var resp = JSON.parse(request.responseText);
            if (resp.success) {
                swal({
                    title: "Success!",
                    text: "Request Mail is sent to the owner",
                    icon: "success",
                    allowOutsideClick: false,
                    closeOnClickOutside: false,
                }).then((value) => {
                    if (value)
                        window.location.replace("/dashboard");
                });
            }
        } else {
            swal({
                title: "Error!",
                text: "Error, while sending request to the requestor",
                icon: "error",
                allowOutsideClick: false,
                closeOnClickOutside: false,
            });
        }
    };

    request.onerror = function (error) {
        console.log("There was an error" + error)
        swal({
            title: "Error!",
            text: "Error, while sending mail",
            icon: "error",
            allowOutsideClick: false,
            closeOnClickOutside: false,
        });
    };

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));

    var formData = "";

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            formData += `${key}=${data[key]}&`
        }
    }
    console.log(formData)
    request.send(formData);

}




$(document).ready(function () {

    console.log(requester_address, owner_address, doc_id)

    contract.methods.checkAlreadyUpload(doc_id).call().then(function (check) {
        if (check) {
            console.log("Document is uploaded by owner")
            contract.getPastEvents('sharedDocumentEvent', {

                    filter: {
                        sharedWith: requester_address,
                        docOwner: owner_address,
                        docid: doc_id

                    },
                    fromBlock: 0,
                    toBlock: 'latest'
                }, function (error, events) {})
                .then(function (docs) {
                    if (docs.length == 0) {
                        console.log("Document is not shared before- good request")
                        getPublicKey();


                    } else {

                        swal({
                            allowOutsideClick: false,
                            closeOnClickOutside: false,
                            title: "Error!",
                            text: "You already have read \
                                         permission for this document. \
                                        Or You are using some old url",
                            icon: "error",
                        }).then((value) => {
                            if (value)
                                logout();
                        });
                    }
                }).catch(function (error) {
                    swal({
                        allowOutsideClick: false,
                        closeOnClickOutside: false,
                        title: "Error!",
                        text: "Error while checking is the document already shared : " + error,
                        icon: "error",
                    });
                });
        } else {
            swal({
                title: "Error!",
                text: "Incorrect url or \
                        requested document is not owned by mentioned owner \
                         Or bad url",
                icon: "error",
                allowOutsideClick: false,
                closeOnClickOutside: false,
            }).then((value) => {
                if (value)
                    logout();
            });
        }
    }).catch(function (error) {
        swal({
            allowOutsideClick: false,
            closeOnClickOutside: false,
            title: "Error!",
            text: "Error while checking is the document owned by owner : " + error,
            icon: "error",
        });
    });

    $("#main-loader").hide().fadeOut("slow");

})