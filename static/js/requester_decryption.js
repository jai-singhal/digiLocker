$(document).ready(function() {

    //fetching doc hask key 
    var doc_hash = "";
    contract.methods.getDocumentListbyDocId("0x38d4022993214ae09a38d45ea536fe817f40ecaba822d89a62d4e7a889891ee3").call().then(function(own){
        console.log(own)
        console.log(own[0],own[3],own[4],own[6])
        doc_hash = own[3]; //Doc Hash from documentId 
    
    });
    
    $("#main-loader").hide();
   
})