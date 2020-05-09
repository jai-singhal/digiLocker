

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
        var documents = [];
        var i = 0;
        for(var k = 0; k < docs[0].length; k++){
            documents[i] = {}
            documents[i++].filename = docs[0][k]
        }
            
        i = 0;
        for(var k = 0; k < docs[1].length; k++)
            documents[i++].timestamp = docs[1][k]

        // i = 0;
        // for(var k = 0; k < docs[2].length; k++)
        //     documents[i++].doc_id = docs[1][k]
        // i = 0;
        // for(var k = 0; k < docs[1].length; k++)
        //     documents[i++].timestamp = docs[1][k]
        $("#document_table thead").append(
            `<tr>
            <th>Serial Number</th>
            <th>Document Name</th>
            <th>Uploaded Date</th>
            <th>Action</th>
            </tr>`
        )
        for(var j = 0; j <documents.length; j++){
            $("#document_table tbody").append(
                `<tr>
                <td>Document #${j+1}</td>
                <td>${documents[j].filename}</td>
                <td>${documents[j].timestamp}</td>
                <td><button class = "btn btn-primary" id = "doc_${j}">Share</button></td>
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


// $("#search_by_docid").click(function(e){
//     e.preventDefault();
//     let doc_id = $("#docid").val();
//     if(doc_id !== ""){
//         searchAjaxCall(doc_id, "/search/doc")
//     }

// });

/*$("#search_by_useradd").click(function(e){
     e.preventDefault();
     let uid = $("#user_address").val();
     //if(uid !== ""){
       //  searchAjaxCall(uid, "/search/user")
     //}
     
        console.log(uid)
        contract.methods.getDocumetList(uid).call().then(function(obj){
                console.log(obj)
        });

    
 });*/

$(document).ready(function(){
    checkAlreadyRegiteredUser()
    showBalance()
    getDocCount();
    displayDocuments(); 
    $("#main-loader").hide();
    $('.modal').modal();
    $('.collapsible').collapsible();
})
