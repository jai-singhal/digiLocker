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
        console.log(docs)
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
        $("#document_table thead").append(
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
    contract.methods.shareDocumentwithUser(doc_id, address, 0).call().then(function(obj){
        console.log(obj) 

        for(var k = 0; k < obj[0].length; k++){
            userAddrrs[i] = {}
            userAddrrs[i++].address = obj[0][k]
        }
            
        i = 0;
        for(var k = 0; k < obj[1].length; k++)
        userAddrrs[i++].permission = docs[1][k]

        $("#shared_doc_table thead").append(
            `<tr>
            <th>Serial Number</th>
            <th>User Address</th>
            <th>Permisson</th>
            </tr>`
        )
        for(var j = 0; j < userAddrrs.length; j++){
            $("#document_table tbody").append(
                `<tr>
                <td>Document #${j+1}</td>
                <td>${userAddrrs[j].address}</td>
                <td>${userAddrrs[j].permission}</td>
                </tr>`
            )
        }
    }); 
});

$(document).on('click', '.sharedoc', function() { 
    $('#shareDocModel').modal("open"); 
    var _this = $(this);
    var doc_id = _this.attr("doc_id");
    var doc_name = _this.attr("doc_name");
    $(".doc_name_modal").html("Share doc: " + doc_name)
    
    $('#shareThisDoc').submit(function(e){
        e.preventDefault();
        var email = $("share_email_").val();
        var permission = $("select_permission").val();
        console.log(email, permission)
        contract.methods.shareDocumentwithUser(
            doc_id, email, permission
        ).send().then(function(res){
            // console.log("xx", err, res)
            window.location.replace(resp.redirect_url);
            swal({
                title: "Success!",
                text: "Shared with " + email,
                icon: "success",
            });
        });
        $('#shareDocModel').modal("close"); 
    })
});



// $(".shared_with").click(function(){
//     $('#sharedDocumentsModel').openModal(); 
//     var _this = $(this);
//     var doc_id = _this.attr("doc_id");
//     console.log(doc_id, address)
//     contract.methods.shareDocumentwithUser(doc_id, address, 0).call().then(function(obj){
//         console.log(obj)
//     });
// })


$(document).ready(function(){
    checkAlreadyRegiteredUser()
    showBalance()
    getDocCount();
    displayDocuments(); 
    $("#main-loader").hide();
    $('.modal').modal();
    $('.collapsible').collapsible();



})
