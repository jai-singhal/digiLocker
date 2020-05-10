function getDocumentDetails() {

    var docid = document.getElementById("_docId").innerHTML;
    console.log(docid)

    contract.methods.getDocumentListbyDocId(docid).call().then(function(docs) {
        console.log(docs)

        var docId = docs[0];
        var docName = docs[1];
        var docHash = docs[3];
        var name = docs[4];
        var email = docs[5];
        var lastName = docs[6]
        var contactDetails = docs[7]

        $("#document_table thead").append(
            `<tr><th>Document Name</th><td>${docs[1]}</td></tr>
            <tr><th>Uploaded Date</th><td>${docs[2]}</td></tr>
            <tr><th>Uploaded By User Name</th><td id = "owner_name">${docs[4]+" "+docs[6]}  </td></tr>
            <tr><th>Uploaded By Email Address</th><td id = "owner_email">${docs[5]}</td></tr>
            <tr><th>Contact Details</th><td>${docs[7]}</tr>
            <tr><td><button class = "btn btn-primary sharedoc" doc_id=${docs[0]} doc_name=${docs[1]}>Raise Request To Access</button></td></tr>`
        )
    });

}

$(document).on('click', '.sharedoc', function() {
    $('#shareDocModel').modal("open");
    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_name = _this.attr("doc_name");
    $(".doc_name_modal").html("Share doc: " + doc_name)
    var email = "";
    contract.methods.getEmailIdByAddrss().call().then(function(_email) {
        console.log(_email)
        if (_email != null || _email != "") {
            email = _email;
        }
    });

    $('#shareThisDoc').submit(function(e) {
        e.preventDefault();
        // var email = $("#share_email_").val();

        var permission = 0;
        contract.methods.isValidSharableUser(email).call().then(function(res) {
            if (res) {
                contract.methods.checkAlreadyShared(doc_id, email).call().then(function(res) {
                    if (!res) {
                        console.log(res)
                        //send the mail
                        sendRequestMailAjax(doc_id, email, doc_name);

                    } else {
                        swal({
                            title: "Warning!",
                            text: "You have already have read \
                                permission for this document. \
                                Or you already raised the request for this document",
                            icon: "warning",
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
        }).catch(function(error) {
            swal({
                title: "Error!",
                text: "Error while sharing doc " + error,
                icon: "error",
            });
        });

    })
});

function sendRequestMailAjax(doc_id, email, doc_name){
    var owner_email = $("#owner_email").html();
    console.log(owner_email)
    contract.methods.getAddressByEmail(owner_email).call().then(function(owner_address_) {
        var data = {
            "doc_id": doc_id,
            "requester_email": email,
            "doc_name": doc_name,
            "requester_address": address,
            "owner_address": owner_address_,
            "owner_email": owner_email,
            "owner_name":$("#owner_name").html(),
        }

        var request = new XMLHttpRequest();
        request.open('POST', "/post/api/send/request/mail", true);
        request.onload = function () {
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

$(document).ready(function() {
    getDocumentDetails();
    $("#main-loader").hide();
    $('.modal').modal();
    $('.collapsible').collapsible();
})