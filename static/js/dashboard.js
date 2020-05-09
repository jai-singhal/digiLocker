var documents = [];

function showBalance(){
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

function displayDocuments(){
    // contract.methods.getUseraccessKey().call().then(function(obj,err){
    //     console.log(obj, "Xxx")
    //     // console.log("err")                   
    // });
    contract.methods.getOwnerDocumetList().call().then(function(docs){
        var i = 0;
        for(var k = 0; k < docs[0].length; k++){
            documents[i] = {}
            documents[i++].filename = docs[0][k]
        }
            
        i = 0;
        for(var k = 0; k < docs[1].length; k++)
            documents[i++].timestamp = docs[1][k]

        i = 0;
        for(var k = 0; k < docs[2].length; k++)
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
        for(var j = 0; j < documents.length; j++){
            $("#document_table tbody").append(
                `<tr>
                <td>Document #${j+1}</td>
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
    })
    .catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching documents" + error,
            icon: "error",
        });
   });    
}

function getDocCount(){
    contract.methods.getDocCountByUserId().call().then(function(obj){
        $("#total_docs").html(obj);

    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching documents count" + error,
            icon: "error",
        });
   });
}
$(document).on('click', '.shared_with', function() { 
    $('#sharedDocumentsModel').modal("open"); 
    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_name = _this.attr("doc_name");
    $(".doc_name_modal").html(doc_name)
    var userAddrrs = [];
    contract.methods.getUserAddressofSharedDoc(doc_id).call().then(function(obj){
        var i =0;
        for(var k = 0; k < obj[0].length; k++){
            userAddrrs[i] = {}
            userAddrrs[i++].address = obj[0][k]
        }
            
        i = 0;
        for(var k = 0; k < obj[1].length; k++)
            userAddrrs[i++].permission = obj[1][k]

        $("#shared_doc_table thead").html(
            `<tr>
            <th>Serial Number</th>
            <th>User Address</th>
            <th>Permisson</th>
            </tr>`
        )
        for(var j = 0; j < userAddrrs.length; j++){
            var ptype;
            if(userAddrrs[j].permission == 0)
                ptype = "Read"
            else
                ptype = "Modify"
            $("#shared_doc_table tbody").append(
                `<tr>
                <td>Document #${j+1}</td>
                <td>${userAddrrs[j].address}</td>
                <td>${ptype}</td>
                </tr>`
            )
        }
    }); 
});


// TO share the doc, open the modal and submit the form
$(document).on('click', '.sharedoc', function() { 
    $('#shareDocModel').modal("open"); 
    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_name = _this.attr("doc_name");
    $(".doc_name_modal").html("Share doc: " + doc_name)
    
    $('#shareThisDoc').submit(function(e){
        e.preventDefault();
        var email = $("#share_email_").val();
        var permission = 0;

        contract.methods.isValidSharableUser(email).call().then(function(res){
            if(res){
                contract.methods.checkAlreadyShared(doc_id, email).call().then(function(res){
                    if(!res){
                        contract.methods.shareDocumentwithUser(
                            doc_id, email, permission
                        ).send(res).then(function(res){
                            $('#shareDocModel').modal("close"); 
                            swal({
                                title: "Success!",
                                text: "Shared with " + email,
                                icon: "success",
                            });
                        }).catch(function (error) {
                            swal({
                                title: "Error!",
                                text: "Error while checking user validity " + error,
                                icon: "error",
                            });
                        });
                    }
                    else{
                        swal({
                            title: "Error!",
                            text: "This email is already shared with this document",
                            icon: "error",
                        });
                    }
                });
            }
            else{
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


$(document).ready(function(){
    checkAlreadyRegiteredUser()
    showBalance()
    getDocCount();
    displayDocuments(); 
    $("#main-loader").hide();
    $('.modal').modal();
    $('.collapsible').collapsible();
})
