var documents = [];
var docList = [];

var resident_address = document.getElementById("main_id").getAttribute("user_address");

function showBalance() {
    web3.eth.getBalance(address, (err, balance) => {
        var mbalance = web3.utils.fromWei(balance, "ether");
        $(".funds").html(mbalance)
    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching balance" + error,
            icon: "error",
            allowOutsideClick: false,
            closeOnClickOutside: false,
        });
    });
}

function displayResidentUploadedDocs() {

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
                <td><a class = 'tooltipped' 
                data-position="bottom" data-tooltip="${documents[j].doc_id}" 
                >Doc #${j+1}</td>
                <td>${documents[j].filename}</td>
                <td>${documents[j].timestamp}</td>
                <td>
                <button
                class = "btn shared_with"
                doc_id="${documents[j].doc_id}"
                doc_name="${documents[j].filename}"
                >Click to Reveal<i class="material-icons tiny left">folder_shared</i>
                </button></td>
                <td><button 
                    class = "btn btn-primary sharedoc"
                    doc_id="${documents[j].doc_id}"
                    doc_name="${documents[j].filename}">
					Share<i class="material-icons tiny left">share</i></button></td>
                </tr>`
            )
        }
        $('.tooltipped').tooltip();
        getUsrDetails();
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
$(document).on('click', '.shared_with', function () {
    $('#sharedDocumentsModel').modal("open");
    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_name = _this.attr("doc_name");
    $(".doc_name_modal").html("Shared with: " + doc_name)


    contract.getPastEvents('sharedDocumentEvent', {
            filter: {
                docid: doc_id,
                docOwner: address
            }, // Using an array means OR: e.g. 20 or 23
            fromBlock: 0,
            toBlock: 'latest'
        }, function (error, events) {
        })
        .then(function (events) {
            if (events.length == 0)
                $("#shared_doc_table tbody").html(
                    "<br><center style = 'color:red'>\
                <h6>This document is not shared with anyone.</h6></center>"
                )
            else {
                $("#shared_doc_table thead").html(
                    `<tr>
                <th>Serial Number</th>
                <th>User Address</th>
                <th>Permisson</th>
                </tr>`
                )
                $("#shared_doc_table tbody").html("");
                for (var j = 0; j < events.length; j++) {
                    var ptype;
                    if (events[j].returnValues.permission == "0")
                        ptype = "Read"
                    else
                        ptype = "Modify"
                    $("#shared_doc_table tbody").append(
                        `<tr>
                    <td>#${j+1}</td>
                    <td>${events[j].returnValues.sharedWith}</td>
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
                allowOutsideClick: false,
                closeOnClickOutside: false,
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
    //console.log('resident',resident_address)
    $('#shareThisDoc').submit(function (e) {
        e.preventDefault();
        var email = $("#share_email_").val();
        var mkey = $("#share_mkey_").val();

        var permission = 0; //read by default: TODO

        contract.methods.isValidSharableUser(email).call().then(function (res1) {
            if (res1) {
                contract.methods.getAddressByEmail(email).call().then(function (req_address) {
                    // console.log(address, req_address, doc_id)

                    contract.getPastEvents('sharedDocumentEvent', {
                            filter: {
                                sharedWith: req_address,
                                docOwner: address,
                                docid: doc_id
                            }, // Using an array means OR: e.g. 20 or 23
                            fromBlock: 0,
                            toBlock: 'latest'
                        }, function (error, events) {})
                        .then(function (docs) {
                            if (!docs.length) { // check the length, if 0, not shared
                                $("#main-loader").show();
                                contract.methods.getUseraccessKey().call().then(function (mkeyHash) {
                                    var request = new XMLHttpRequest();
                                    let accesskey_url = "/api/user/accesskey";
                                    request.open('POST', accesskey_url, true);
                                    request.onload = function () {
                                        if (request.status == 200) {
                                            var resp = JSON.parse(request.responseText);
                                            if (resp.valid == false || resp.success == false) {
                                                swal({
                                                    title: "Alert!",
                                                    text: "Master key is not valid",
                                                    icon: "error",
                                                    allowOutsideClick: false,
                                                    closeOnClickOutside: false,
                                                });
                                            } else {
                                                contract.methods.shareDocumentwithUser(
                                                    doc_id, resident_address, permission, req_address).send().then(function (res3) {
                                                    sendShareMailAjax(doc_id, email, doc_name);
                                                    $("#main-loader").hide();
                                                }).catch(function (error) {
                                                    swal({
                                                        title: "Error!",
                                                        text: "Error while checking user validity " + error,
                                                        icon: "error",
                                                        allowOutsideClick: false,
                                                        closeOnClickOutside: false,
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
                                            allowOutsideClick: false,
                                            closeOnClickOutside: false,
                                        });
                                        $("#main-loader").hide();
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
                                    text: "This Document is already shared with this Organization/requestor",
                                    icon: "error",
                                    allowOutsideClick: false,
                                    closeOnClickOutside: false,
                                });
                            }
                        });
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
            }).then((value) => {
                if (value)
                    logout();
            });
        });

    })
    $("#main-loader").hide();
});


function sendShareMailAjax(doc_id, email, doc_name) {
    $("#main-loader").show();
    contract.methods.getAddressByEmail(email).call().then(function (requester_address) {
        contract.methods.getEmailIdByUsrAddr(address).call().then(function (owner_email_name) {
            contract.methods.getPublicKey(requester_address).call().then(function (req_pub_key) {
                contract.methods.getDocIndex(doc_id, address).call().then(function (docIndex) {
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
                        "docIndex": docIndex
                    }

                    var request = new XMLHttpRequest();
                    request.open('POST', "/post/api/send/aproove/mail", true);
                    request.onload = function () {
                        $("#main-loader").hide();

                        if (request.status == 200) {
                            // Success!
                            var resp = JSON.parse(request.responseText);
                            if (resp.success) {
                                swal({
                                    title: "Success!",
                                    text: "Shared with " + email,
                                    icon: "success",
                                    allowOutsideClick: false,
                                    closeOnClickOutside: false,
                                });
                            } else {
                                swal({
                                    title: "Error!",
                                    text: "Error" + resp.error,
                                    icon: "error",
                                    allowOutsideClick: false,
                                    closeOnClickOutside: false,
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
                        $('#share_email_').val("");
                        $('#share_mkey_').val("");
                        $('#shareDocModel').modal("close");
                        $("#main-loader").hide();

                    };

                    request.onerror = function (e) {
                        alert("Upload failed - there was an error" + e);
                        $("#main-loader").hide();
                    };
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    request.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));

                    var formData = "";
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            formData += `${key}=${data[key]}&`
                        }
                    }
                    $("#main-loader").show();
                    request.send(formData);
                });
            });
        });
    });
    $("#main-loader").hide();

}

function groupBy(objectArray, property) {
    return objectArray.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        // Add object to list for given key's value
        acc[key].push(obj);
        return acc;
    }, {});
}

function getDocName(docid, owner_address) {
    contract.methods.getDocumentName(
        docid, owner_address).call().then(function (docname) {
        $(`.docname[doc_id="${docid}"][docOwner="${owner_address}"]`).html(docname)
    })
}


$(document).on('click', '.verify_doc', function () 
{

    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_owner = _this.attr("docOwner");
    contract.methods.getDocumentName(doc_id,doc_owner).call().then(function(docname)
    {

            $('#declarationModel').modal("open");
            
            $("#doc_id").html(doc_id);
            $("#doc_owner").html(doc_owner);
            $(".doc_name_modal").html("Verification of the Document :"+docname);
            $("#doc_name").html(docname);
    
    }).catch(function(error)
    {
        console.log("error while calling getDocumentName() -"+error.message)
    });
    
    $('#verifyThisDoc').submit(function (e) {
        $("#main-loader").show();
        e.preventDefault();

        // console.log("Button Clicked")
        contract.getPastEvents('verifyDocumentEvent',
        {
            filter:
            {
                 docid: doc_id,
                 _owner: doc_owner, 
                 _requester: address

            },
            fromBlock:0,
            toBlock:'latest'
        
        }, function(error,events){})
        .then(function(vlist)
        {   
                if(vlist.length==0)
                {
                    console.log(vlist)
                         contract.methods.verifyUserDocument(doc_id,doc_owner,address).send().then(function()
                     {
                        swal
                        ({
                            title: "Success!",
                            text: "Document is verified successfully",
                            icon: "success",
                            allowOutsideClick: false,
                            closeOnClickOutside: false,
                         });
                        $('#declarationModel').modal("close");
                        $("#main-loader").hide();

                     }).catch(function(error)
                            {
                                console.log("verifyUserDocument() contract calling failed-"+error.message)
                                swal
                                ({
                                      title: "Error!",
                                      text: "An error is encountered while running verifyUserDocument "+error.message,
                                      icon: "error",
                                      allowOutsideClick: false,
                                      closeOnClickOutside: false,
                                });
                                $('#declarationModel').modal("close");
                                $("#main-loader").hide();
                            });
                }
                 else
                {
                    console.log(vlist)
   
                    swal
                    ({
                        title: "Warning!",
                        text: "Document is already verified!!",
                        icon: "warning",
                        allowOutsideClick: false,
                        closeOnClickOutside: false,
                     });
                     $('#declarationModel').modal("close");
                     $("#main-loader").hide();

                }
        })

    })

});



function getSharedDocListForRequestor() {
    // address -> requester
    contract.getPastEvents('sharedDocumentEvent', {
            filter: {
                sharedWith: address
            }, // Using an array means OR: e.g. 20 or 23
            fromBlock: 0,
            toBlock: 'latest'
        }, function (error, events) {})
        .then(function (docs) {
            for (var k = 0; k < docs.length; k++) {
                docList[k] = {}
                
                docList[k].docName = `<a 
                onClick=getDocName("${docs[k].returnValues.docid}","${docs[k].returnValues.docOwner}")
                    >Click to reveal</a>`;

                docList[k].docId = docs[k].returnValues.docid;
                docList[k].permission = docs[k].returnValues.permission;
                docList[k].docOwner = docs[k].returnValues.docOwner;
            }

            const docGroup = groupBy(docList, 'docOwner');
            $("#sharedDocumentListByUser ul").html(`
            <li class="z-depth-3" style = "padding:15px;">
            <h6 class = "bold">Document Shared with you</h6>
            </li>
        `);
            for (const property in docGroup) {
                contract.methods.getEmailIdByUsrAddr(property).call().then(function (usrdetails) {

                    $("#sharedDocumentListByUser ul").append(
                        `
                    <li>
                    <div class="collapsible-header">  
                    <i class="material-icons">mail</i>
                    ${usrdetails[0]}: ${usrdetails[1]} ${usrdetails[2]}
                    
                    <span class="badge blue new" data-badge-caption="">
                        ${docGroup[property].length}</span>
                        <i class="material-icons">expand_more</i>
                    </div>
                    <div class="collapsible-body">
                    <table property = "${property}" 
                        class = "responsive-table highlight">
                    <thead>
                    </thead>
                    <tr>
                    <th>Document Id</th>
                    <th>Document Name</th>
                    <th>Permission</th>
                    <th>Action</th>
                    </tr>
                    <tbody>
                    </tbody>
                    </div>
                </li>
                `
                    )
                    for (var j = 0; j < docGroup[property].length; j++) {
                        //var doc_name = docGroup[property][j].docName;
                        var ptype;
                        if (docGroup[property][j].permission == 0)
                            ptype = "Read"
                        else
                            ptype = "Modify"

                        $(`#sharedDocumentListByUser ul table[property="${property}"]`).append(
                            `<tr>
                        <td doc_id = "${docGroup[property][j].docId}">Document#${j+1}</td>
                        <td class = "docname" 
                        doc_id = "${docGroup[property][j].docId}"
                        docOwner = "${property}"
                        >${docGroup[property][j].docName}</td>
                        <td>${ptype}</td>
                        <td><a class="btn verify_doc" doc_id = "${docGroup[property][j].docId}" docOwner = "${property}">
                        <i class="material-icons tiny left">verified_user</i>Verify</a></td>
                        </tr>`
                        )
                    }
                });

            }
            getUsrDetails();

        })
        .catch(function (error) {
            swal({
                title: "Error!",
                text: "Error while getting shared doc " + error,
                icon: "error",
                allowOutsideClick: false,
                closeOnClickOutside: false,
            }).then((value) => {
                if (value)
                    window.location.reload();
            });
        });;
}

function getUsrDetails() {

    contract.methods.getEmailIdByAddrss().call().then(function (usrdetails) {

        $("#email_addr").html(usrdetails[0]);
        $("#usr_name").html(usrdetails[1] + " " + usrdetails[2]);
        //For Requester Dashboard
        $("#org_addr").html(usrdetails[0]);
        $("#org_name").html(usrdetails[1]);
    }).catch(function(error){
        swal({
            title: "Error!",
            text: "Error while fetching Logged in user details : " + error,
            icon: "error",
            allowOutsideClick: false,
            closeOnClickOutside: false,
        });
    });

}


$(document).ready(function () {
    getUsrDetails();
    contract.methods.getUserType().call().then(function (utype) {
        $("main").css("display", "block");

        if (utype == 1) { // resident
            $("#requestorDashboard").remove();
            getDocCount();
            displayResidentUploadedDocs();
        } else if (utype == 2) { // requestor
            $("#residentDashboard").remove();
            getSharedDocListForRequestor();
        } else {
            swal({
                title: "Error!",
                text: "Not logined",
                icon: "error",
                allowOutsideClick: false,
                closeOnClickOutside: false,
            }).then((value) => {
                if (value)
                    logout();
            });
        }
        showBalance();

    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching user type: " + error,
            icon: "error",
            allowOutsideClick: false,
            closeOnClickOutside: false,
        });
    });
    $("#main-loader").hide().fadeOut("slow");
    $('.modal').modal();
    $('.collapsible').collapsible();

})