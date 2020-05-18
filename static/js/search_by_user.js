var _glbladrress = ""; //Address of owner or resident to whom we request for document
var _reqaddress = "";

function displayDocumentsList() {

    var _uid = document.getElementById("_useraddress").innerHTML;
    //console.log(_uid)
    var x = "";

    if (_uid.indexOf("@") > 0) {
        contract.methods.getAddressByEmail(_uid).call().then(function (result) {
            //console.log(result)
            x = result;
            _glbladrress = result;
            //List of docs uploaded by owner we searched
            contract.methods.getDocumetList(x).call().then(function (docs) {
                console.log(docs)
                var documents = [];
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

                $("#document_table thead").append(
                    `<tr>
        <th>Serial Number</th>
        <th>Document Name</th>
        <th>Uploaded Date</th>
        <th>Action</th>
        </tr>`
                )

                for (var j = 0; j < documents.length; j++) {
                    $("#document_table tbody").append(
                        `<tr>
            <td>Document #${j+1}</td>
            <td>${documents[j].filename}</td>
            <td>${documents[j].timestamp}</td>
            <td><button class = "btn btn-primary sharedoc" doc_id="${documents[j].doc_id}"
             doc_name="${documents[j].filename}">Request</button></td>
            </tr>`
                    )
                }
            }).catch(function (error) {
                swal({
                    title: "Error!",
                    text: "Error while fetching documents" + error,
                    icon: "error",
                    allowOutsideClick: false,
                    closeOnClickOutside: false,
                });
            });
        });
    } else {
        x = _uid;
        _glbladrress = _uid;

        //console.log(x)
        contract.methods.getDocumetList(x).call().then(function (docs) {
            var documents = [];
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

            $("#document_table thead").append(
                `<tr>
        <th>Serial Number</th>
        <th>Document Name</th>
        <th>Uploaded Date</th>
        <th>Action</th>
        </tr>`
            )

            for (var j = 0; j < documents.length; j++) {
                $("#document_table tbody").append(
                    `<tr>
            <td>Document #${j+1}</td>
            <td>${documents[j].filename}</td>
            <td>${documents[j].timestamp}</td>
            <td><button class = "btn btn-primary sharedoc" doc_id="${documents[j].doc_id}"
             doc_name="${documents[j].filename}">Request</button></td>
            </tr>`
                )
            }
        }).catch(function (error) {
            swal({
                title: "Error!",
                text: "Error while fetching documents" + error,
                icon: "error",
                allowOutsideClick: false,
                closeOnClickOutside: false,
            });
        });
    }
}

function getDocCount() {
    contract.methods.getDocCountByUserId().call().then(function (obj) {
        $("#total_docs").html(obj);

    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching documents count" + error,
            icon: "error",
            allowOutsideClick: false,
            closeOnClickOutside: false,
        });
    });
}

$(document).on('click', '.sharedoc', function () {
    $('#shareDocModel').modal("open");
    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_name = _this.attr("doc_name");
    $(".doc_name_modal").html("Share doc: " + doc_name)
<<<<<<< HEAD
    
=======


>>>>>>> 8d65e03ad2f24e8247b4e50d1b817ab640fe8b1c
    var email = "";
    contract.methods.getEmailIdByAddrss().call().then(function (_email) {
        if (_email[0] != null || _email[0] != "") {
            email = _email[0];

        }

    });

    $('#shareThisDoc').submit(function (e) {
        e.preventDefault();

        var permission = 0;
        contract.methods.isValidSharableUser(email).call().then(function (res) {
            if (res) {
                contract.getPastEvents('sharedDocumentEvent', {

                        filter: {
                            sharedWith: address,
                            docOwner: _glbladrress,
                            docid: doc_id

                        },
                        fromBlock: 0,
                        toBlock: 'latest'
                    }, function (error, events) {})
                    .then(function (docs) {
                        if (docs.length == 0) {
                            console.log(res)
                            sendRequestMailAjaxUser(doc_id, email, doc_name);
                        } else {
                            swal({
                                allowOutsideClick: false,
                                closeOnClickOutside: false,
                                title: "Warning!",
                                text: "You already have read \
                            permission for this document. \
                            Or you already raised the request for this document.",
                                icon: "warning",
                            });
                        }
                    });
            } else {
                swal({
                    title: "Error!",
                    text: "Not a valid email. This email is not a valid or not registered!!",
                    icon: "error",
                    allowOutsideClick: false,
                    closeOnClickOutside: false,
                });
            }
        }).catch(function (error) {
            swal({
                title: "Error!",
                text: "Error while sharing doc " + error,
                icon: "error",
                allowOutsideClick: false,
                closeOnClickOutside: false,
            });
        });

    })

});

//what if emailid is used to search the document this case is yet to handle
function sendRequestMailAjaxUser(doc_id, email, doc_name) {
    //Need owners email address : user id we have already
    var data = {};
    var owner_address_ = document.getElementById("_useraddress").innerHTML;

    if (owner_address_.indexOf("@") > 1) {
        owner_address_ = _glbladrress;
        // console.log(_glbladrress, owner_address_)
    }
    // console.log(owner_address_)
    var owner_email = "";
    var owner_name = "";
    var address = "";

    contract.methods.getEmailIdByUsrAddr(owner_address_).call().then(function (result) {

        // console.log(result)
        owner_email = result[0];
        owner_name = result[1] + " " + result[2];

        contract.methods.getEmailIdByAddrss().call().then(function (resp) {
            //Logged in users' email id and then fetching address
            // console.log(resp)
            address = resp[0];

            contract.methods.getAddressByEmail(address).call().then(function (obj) {
                // console.log(obj)
                address = obj;

                data = {
                    "doc_id": doc_id,
                    "requester_email": email,
                    "doc_name": doc_name,
                    "requester_address": address,
                    "owner_address": owner_address_,
                    "owner_email": owner_email,
                    "owner_name": owner_name,
                }

                var request = new XMLHttpRequest();
                request.open('POST', "/post/api/send/request/mail", true);

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
                            text: "Error",
                            icon: "error",
                            allowOutsideClick: false,
                            closeOnClickOutside: false,
                        });
                    }
                };

                request.onerror = function () {
                    console.log("Error while raising the request(sending mail to owner) - while searching by user id/email id");
                };
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));

                var formData = "";
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        formData += `${key}=${data[key]}&`
                    }
                }
                request.send(formData);

            });

        });

    });

}


$(document).ready(function () {
    displayDocumentsList();
    // getDocCount();
    $("#main-loader").hide();
    $('.modal').modal();
    $('.collapsible').collapsible();
})