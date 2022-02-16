var _residentaddr = "";

function getDocumentDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const docid = urlParams.get('docid');
    //console.log(docid)
    try {
        contract.methods.getDocumentListbyDocId(docid).call().then(function (docs) {
            //console.log(docs)
            $("#document_table thead").append(
                `<tr><th>Document Name</th><td>${docs[1]}</td></tr>
                <tr><th>Uploaded Date</th><td>${docs[2]}</td></tr>
                <tr><th>Uploaded By User Name</th><td id = "owner_name">${docs[4]+" "+docs[6]}  </td></tr>
                <tr><th>Uploaded By Email Address</th><td id = "owner_email">${docs[5]}</td></tr>
                <tr><td><button class = "btn btn-primary sharedoc" doc_id=${docs[0]} doc_name=${docs[1]}>Raise Request To Access</button></td></tr>`
            );
        }).catch(function (error) {
            swal({
                title: "Error!",
                text: "Error while fetching the doc " + error,
                icon: "error",
                allowOutsideClick: false,
                closeOnClickOutside: false,
            });
        });
    } catch (err) {
        swal({
            title: "Error!",
            text: "No doc with following doc id exists",
            icon: "error",
            allowOutsideClick: false,
            closeOnClickOutside: false,
        }).then((value) => {
            window.location.replace("/dashboard");
        });
    }

}

$(document).on('click', '.sharedoc', function () {
    $('#shareDocModel').modal("open");
    _residentaddr = "";
    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_name = _this.attr("doc_name");
    var owner_email = document.getElementById("owner_email").innerHTML;
    console.log(owner_email)
    $(".doc_name_modal").html("Share doc: " + doc_name)
    var email = "";
    contract.methods.getEmailIdByAddrss().call().then(function (_email) {
        console.log(_email)
        if (_email[0] != null || _email[0] != "") {
            email = _email[0];
        }

        contract.methods.getAddressByEmail(owner_email).call().then(function (addrs) {
            _residentaddr = addrs;
            console.log(_residentaddr)
        })

    });

    $('#shareThisDoc').submit(function (e) {
        e.preventDefault();


        var permission = 0;
        contract.methods.isValidSharableUser(email).call().then(function (res) {
            if (res) {

                contract.getPastEvents('sharedDocumentEvent', {

                        filter: {
                            sharedWith: _residentaddr,
                            docOwner: _residentaddr,
                            docid: doc_id

                        },
                        fromBlock: 0,
                        toBlock: 'latest'
                    }, function (error, events) {})
                    .then(function (docs)

                        {
                            console.log(docs)
                            if (docs.length == 0) {
                                console.log(res)
                                //send the mail
                                sendRequestMailAjax(doc_id, email, doc_name);

                            } else {
                                swal({
                                    title: "Warning!",
                                    text: "You already have read \
                                                         permission for this document. \
                                                        Or you already raised the request for this documen.t",
                                    icon: "warning",
                                    allowOutsideClick: false,
                                    closeOnClickOutside: false,
                                });
                            }
                        });

            } else {
                swal({
                    title: "Error!",
                    text: "Not a valid email. This email is not a valid or not regsitered!!",
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

function sendRequestMailAjax(doc_id, email, doc_name) {
    var owner_email = $("#owner_email").html();
    //console.log(owner_email)
    contract.methods.getAddressByEmail(owner_email).call().then(function (owner_address_) {
        var data = {
            "doc_id": doc_id,
            "requester_email": email,
            "doc_name": doc_name,
            "requester_address": address,
            "owner_address": owner_address_,
            "owner_email": owner_email,
            "owner_name": $("#owner_name").html(),
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
                        if (value) {
                            window.location.replace("/dashboard");
                        }
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
}


$(document).ready(function () {
    //checkByEmailUserId();
    $("#main-loader").hide();
    getDocumentDetails();
    $('.modal').modal();
    $('.collapsible').collapsible();
})