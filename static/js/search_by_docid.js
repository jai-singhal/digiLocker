function getDocumentDetails (){
    
    var docid = document.getElementById("_docId").innerHTML;
    console.log(docid)

    contract.methods.getDocumentListbyDocId(docid).call().then(function(docs){
        console.log(docs)

        var docId = docs[0];
        var docName = docs[1];
        var uploadDuration = docs[2];
        var docHash = docs[3];
        var name = docs[4];
        var email = docs[5];
        var lastName = docs[6]
        var contactDetails = docs[7]
        
        $("#document_table thead").append(
            `<tr><th>Document Name</th><td>${docs[1]}</td></tr>
            <tr><th>Uploaded Date</th><td>${docs[2]}</td></tr>
            <tr><th>Uploaded By User Name</th><td>${docs[4]+" "+docs[6]}  </td></tr>
            <tr><th>Uploaded By Email Address</th><td>${docs[5]}</td></tr>
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
    contract.methods.getEmailIdByAddrss().call().then(function(_email)
    {
            console.log(_email)
            if(_email != null || _email != "")
            {
                email = _email;
            }
    });

    $('#shareThisDoc').submit(function(e){
        e.preventDefault();
       // var email = $("#share_email_").val();
       
        var permission = 0;
        console.log(email)
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
   
    
    getDocumentDetails();    
    $("#main-loader").hide();
    $('.modal').modal();
    $('.collapsible').collapsible();
})