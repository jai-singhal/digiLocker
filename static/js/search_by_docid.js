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
            <tr><th>Uploaded By User Name</th><td>${docs[4]} </td></tr>
            <tr><th>Uploaded By Email Address</th><td>${docs[5]}</td></tr>
            <tr><th>Contact Details</th><td>${docs[7]}</tr>
            <tr><td><button class = "btn waves-effect waves-light" id = "doc_${docs[0]}">Raise Request To Access</button></td></tr>`
            
        )
    
    });

    

}


$(document).ready(function(){
   
    
    getDocumentDetails();    
    $("#main-loader").hide();
    $('.modal').modal();
    $('.collapsible').collapsible();
})