var doc_hash = "";
var doc_name = "";


function displayDocInfo(docInfo) {
    $("#document_table thead").append(
        `<tr><th>Document Name</th><td>${docInfo[1]}</td></tr>
        <tr><th>Uploaded Date</th><td>${docInfo[2]}</td></tr>
        <tr><th>Uploaded By User Name</th><td id = "owner_name">${docInfo[4]+" "+docInfo[6]}  </td></tr>
        <tr><th>Uploaded By Email Address</th><td id = "owner_email">${docInfo[5]}</td></tr>
        `
    );
    if (docInfo[7]) {
        $("#document_table thead").append(`
            <tr><th>Contact Details</th><td>${docInfo[7]}</tr>
        `);
    }
}

function displayPrivateKeyField() {
    $("#requestorDecryption").html(`
    <div class="row">
        <h5> Enter your private key to download the document</h5>
    </div>

    <div class="row">
        <div class="input-field col s12">
            <input id="private_key" type="password" class="validate" />
            <label for="private_key">Enter your private key</label>
        </div>
    </div>
    <div class="row">
    <center><a class="btn waves-effect waves-light" type="submit" name="action">Perform Decryption</a>
    </center>
    </div>
    `)
}


function downloadFile(dochash, doc_id, owner_address, privKey, ekey, doc_name) {
    var data = new FormData();
    data.append("X-CSRFToken", getCookie('csrftoken'));
    data.append("doc_id", doc_id);
    data.append("dochash", dochash);
    data.append("owner_add", owner_address);
    data.append("privKey", privKey);
    data.append("ekey", ekey);
    data.append("doc_name", doc_name);
    console.log(data)
    $.ajax({
        url: '/api/post/file/comparehash',
        data: data,
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        success: function (res) {
            if (res.success == true) {
                var decrypted = CryptoJS.AES.decrypt(res.fileData, res.decrypt_key, {
                    iv: res.owner_address,
                    padding: CryptoJS.pad.Pkcs7,
                    mode: CryptoJS.mode.CBC
                }).toString(CryptoJS.enc.Utf8)

                // var decryptedFile = new File([decrypted], res.doc_name, {
                //     type: "text/plain"
                // });

                // var url = window.URL.createObjectURL(decryptedFile);
                swal({
                    title: "Success!",
                    text: `The file ${res.doc_name} is available to download. Click Download button`,
                    icon: "success",
                    button: {
                        text: "Download",
                        closeModal: true,
                        value: true,
                        visible: true,
                        className: "",
                        closeModal: true,
                    },
                }).then((value) => {
                    if (value) {
                        download(decrypted, res.doc_name, "text/plain")
                        swal({
                            title: "Downloaded Completed",
                            text: "File is Downloaded. Close this tab?",
                            icon: "success",
                        }).then((value) => {
                            if (value) {
                                $("#private_key").val("");
                                window.top.close();
                            }
                        });

                    }
                })

            } else {
                swal({
                    title: "Something went wrong!",
                    text: res["error"],
                    icon: "error",
                });
            }
        },
        error: function (res) {
            console.log(res, "error")
        }
    });
}



$(document).ready(function () {
    let doc_id = $("#requestorDecryption").attr("doc_id");
    // displayPrivateKeyField();
    //fetching doc hask key 
    contract.methods.getDocumentListbyDocId(
        doc_id).call().then(function (docInfo) {
        $("#main-loader").hide().fadeOut("slow");
        doc_hash = docInfo[3];
        console.log(docInfo)
        displayDocInfo(docInfo)
        doc_hash = docInfo[3]; //Doc Hash from documentId 
        doc_name = docInfo[1]; //Doc name from documentId 
    });
})

$("#requestorDecryption").submit(function (e) {
    e.preventDefault();
    let doc_id = $("#requestorDecryption").attr("doc_id");
    var private_key = $("#private_key").val();
    let owner_address = $("#requestorDecryption").attr("owner_address");
    let ekey = $("#requestorDecryption").attr("ekey");
    console.log(
        doc_hash, //Doc Hash from documentId 
        doc_id,
        owner_address,
        private_key,
        ekey,
        doc_name
    )
    if (private_key.length == 0) {
        alert("Please enter private key");
        return false;
    }

    downloadFile(
        doc_hash, //Doc Hash from documentId 
        doc_id,
        owner_address,
        private_key,
        ekey,
        doc_name
    );
})