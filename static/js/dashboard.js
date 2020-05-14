var documents = [];

function showBalance() {
    web3.eth.getBalance(address, (err, balance) => {
        var mbalance = web3.utils.fromWei(balance, "ether");
        $("#funds").html(mbalance)
    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching balance" + error,
            icon: "error",
        });
    });
}

function displayDocuments() {

    // contract.methods.getUseraccessKey().call().then(function(obj,err){
    //     console.log(obj, "Xxx")
    //     // console.log("err")                   
    // });
    contract.methods.getOwnerDocumetList().call().then(function (docs) {
        var i = 0;
        for (var k = 0; k < docs[0].length; k++) {
            documents[i] = {}
            documents[i++].filename = docs[0][k]
        }

        i = 0;
        for (var k = 0; k < docs[1].length; k++)
            documents[i++].timestamp = docs[1][k]

        i = 0;
        for (var k = 0; k < docs[2].length; k++)
            documents[i++].doc_id = docs[2][k]
        // i = 0;
        // for(var k = 0; k < docs[1].length; k++)
        //     documents[i++].timestamp = docs[3][k]
        $("#document_table thead").html(
            `<tr>
            <th>Serial Number</th>
            <th>Document Name</th>
            <th>Uploaded Date</th>
            <th>Shared with</th>
            <th>Action</th>
            </tr>`
        )
        if (documents.length == 0)
            $("#document_table tbody").html(
                "<br><center style = 'color:red'>\
                <h6>You haven't uploaded any document yet.</h6></center>"
            )
        else
            $("#document_table tbody").html("")

        for (var j = 0; j < documents.length; j++) {
            $("#document_table tbody").append(
                `<tr>
                <td>Doc #${j+1}</td>
                <td>${documents[j].filename}</td>
                <td>${documents[j].timestamp}</td>
                <td>
                <button
                class = "btn shared_with"
                doc_id=${documents[j].doc_id}
                doc_name=${documents[j].filename}
                >
                Click to Reveal</button></td>
                <td><button 
                    class = "btn btn-primary sharedoc"
                    doc_id=${documents[j].doc_id}
                    doc_name=${documents[j].filename}
                >Share</button></td>
                </tr>`
            )
        }
    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching documents" + error,
            icon: "error",
        });
    });
}

function getDocCount() {
    contract.methods.getDocCountByUserId().call().then(function (obj) {
        $("#total_docs").html(obj);

    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching documents count" + error,
            icon: "error",
        });
    });
}
$(document).on('click', '.shared_with', function () {
    $('#sharedDocumentsModel').modal("open");
    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_name = _this.attr("doc_name");
    $(".doc_name_modal").html(doc_name)
    contract.methods.getUserAddressofSharedDoc(doc_id).call().then(function (obj) {
        var userAddrrs = [];
        var i = 0;
        for (var k = 0; k < obj[0].length; k++) {
            userAddrrs[i] = {}
            userAddrrs[i++].address = obj[0][k]
        }

        i = 0;
        for (var k = 0; k < obj[1].length; k++)
            userAddrrs[i++].permission = obj[1][k]

        if (userAddrrs.length == 0)
            $("#shared_doc_table tbody").html(
                "<br><center style = 'color:red'>\
                <h6>This document is not shared with anyone.</h6></center>"
            )
        else{
            $("#shared_doc_table thead").html(
                `<tr>
                <th>Serial Number</th>
                <th>User Address</th>
                <th>Permisson</th>
                </tr>`
            )
            $("#shared_doc_table tbody").html("");
            for (var j = 0; j < userAddrrs.length; j++) {
                var ptype;
                if (userAddrrs[j].permission == 0)
                    ptype = "Read"
                else
                    ptype = "Modify"
                $("#shared_doc_table tbody").append(
                    `<tr>
                    <td>#${j+1}</td>
                    <td>${userAddrrs[j].address}</td>
                    <td>${ptype}</td>
                    </tr>`
                )
            }
        }
        
    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching docs " + error,
            icon: "error",
        });
    });
});



// TO share the doc, open the modal and submit the form
$(document).on('click', '.sharedoc', function () {
    $('#shareDocModel').modal("open");
    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_name = _this.attr("doc_name");
    $(".doc_name_modal").html("Share doc: " + doc_name)

    $('#shareThisDoc').submit(function (e) {
        e.preventDefault();
        var email = $("#share_email_").val();
        var mkey = $("#share_mkey_").val();

        var permission = 0; //read by default: TODO

        contract.methods.isValidSharableUser(email).call().then(function (res1) {
            if (res1) {
                contract.methods.checkAlreadyShared(doc_id, email).call().then(function (res2) {
                    if (!res2) {
                        contract.methods.getUseraccessKey().call().then(function(mkeyHash){
                            var request = new XMLHttpRequest();
                            let accesskey_url = "/api/user/accesskey";
                            request.open('POST', accesskey_url, true);
                            request.onload = function () {
                                if (request.status == 200) {
                                    var resp = JSON.parse(request.responseText);
                                    if(resp.valid == false || resp.success == false){
                                        swal({
                                            title: "Alert!",
                                            text: "Master key is not valid",
                                            icon: "error",
                                        });
                                    }
                                    else{
                                        contract.methods.shareDocumentwithUser(
                                            doc_id, email, permission).send().then(function (res3) {
                                                $("#main-loader").show();
                                                sendShareMailAjax(doc_id, email, doc_name);
                                                $("#main-loader").hide();
                                                $('#share_email_').val("");
                                                $('#share_mkey_').val("");
                                                $('#shareDocModel').modal("close");
                                            }).catch(function (error) {
                                                swal({
                                                    title: "Error!",
                                                    text: "Error while checking user validity " + error,
                                                    icon: "error",
                                                });
                                        });

                                    }
                                }
                            };
                            request.onerror = function () {
                                swal({
                                    title: "Alert!",
                                    text: "Error while uploading!!",
                                    icon: "error",
                                  });
                            };
                            var formData = 'master_key=' + mkey + "&mkeydigest=" + mkeyHash;
                            formData += "&upload=" + '0';
                            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                            request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                            request.send(formData);
                        });

                    } else {
                        swal({
                            title: "Error!",
                            text: "This email is already shared with this document",
                            icon: "error",
                        });
                    }
                });
            } else {
                swal({
                    title: "Error!",
                    text: "Not a valid email. This email is not a valid or not regsitered!!",
                    icon: "error",
                });
            }
        }).catch(function (error) {
            swal({
                title: "Error!",
                text: "Error while sharing doc " + error,
                icon: "error",
            });
        });

    })
});




function sendShareMailAjax(doc_id, email, doc_name) {

    contract.methods.getAddressByEmail(email).call().then(function (requester_address) {
        contract.methods.getEmailIdByUsrAddr(address).call().then(function (owner_email_name) {
            contract.methods.getPublicKey(requester_address).call().then(function (req_pub_key) {
                var data = {
                    "master_key": $("#share_mkey_").val(),
                    "req_pub_key": req_pub_key, 
                    "doc_id": doc_id,
                    "doc_name": doc_name,
                    "requester_address": requester_address,
                    "requester_email": email,
                    "owner_address": address,
                    "owner_email": owner_email_name[0],
                    "owner_name": owner_email_name[1] + " " + owner_email_name[2],
                }

                var request = new XMLHttpRequest();
                request.open('POST', "/post/api/send/aproove/mail", true);
                request.onload = function () {
                    if (request.status == 200) {
                        // Success!
                        var resp = JSON.parse(request.responseText);
                        if (resp.success) {
                            swal({
                                title: "Success!",
                                text: "Shared with " + email,
                                icon: "success",
                            });
                        }
                    } else {
                        swal({
                            title: "Error!",
                            text: "Error",
                            icon: "error",
                        });
                    }
                };

                request.onerror = function () {
                    console.log("Registration failed - there was an error");
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
            });
        });
    });
}


$(document).ready(function () {
    checkAlreadyRegiteredUser()
    showBalance()
    getDocCount();
    displayDocuments();
    $("#main-loader").hide();
    $('.modal').modal();
    $('.collapsible').collapsible();
})