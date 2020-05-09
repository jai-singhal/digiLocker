
function displayDocumentsList(){

    var _uid = document.getElementById("_useraddress").innerHTML;
    console.log(_uid)
    contract.methods.getDocumetList(_uid).call().then(function(docs){
    console.log(docs)
    var documents = [];   
    var i = 0;
    for(var k = 0; k < docs[0].length; k++){
        documents[i] = {}
        documents[i++].filename = docs[0][k]
    }    
    
    i = 0;
        for(var k = 0; k < docs[1].length; k++)
            documents[i++].timestamp = docs[1][k]
    

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

    
    }).catch(function (error) {
        swal({
            title: "Error!",
            text: "Error while fetching documents" + error,
            icon: "error",
        });
   }); 
}





$(document).ready(function(){
    //checkAlreadyRegiteredUser()
    //showBalance()
    //getDocCount();
    displayDocumentsList();
    
    
    $("#main-loader").hide();
    $('.modal').modal();
    $('.collapsible').collapsible();
})