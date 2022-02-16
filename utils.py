from eth_utils import is_hex_address
from web3.auto import w3
from eth_account.messages import defunct_hash_message
from flask_mail import Mail, Message
import binascii
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA512
from Crypto.Random import get_random_bytes
from Crypto.PublicKey import RSA


def recover_to_addr(token, signature):
    msghash = defunct_hash_message(text=token)
    address = w3.eth.account.recoverHash(msghash, signature=signature)
    res = is_hex_address(address)
    return address

def generateRSAKeypair():
    keyPair = RSA.generate(2048)
    return (
        keyPair.publickey().export_key().decode(),
        keyPair.export_key().decode()
    )

def getKey(total_doc, masterKey, user_address):
    salt = user_address.lower().strip().encode()
    masterKey = masterKey.strip().encode()
    keys = PBKDF2(masterKey, salt, 512, count=1000, prf= None)
    keys = binascii.hexlify(keys)
    startIndex = (total_doc*16)%450
    if startIndex + 128 >= 500:
        startIndex = total_doc%256
    key = keys[startIndex:startIndex+128]
    return key.decode()

def prepareMailMsg(name, from_mail, address, pr, MAIL_SENDER):
    msg = Message(
        recipients=[from_mail.strip(),],
        sender = MAIL_SENDER
    )

    msgHtml = f"""
        <html>
        <head><title>Welcome To DigiLocker</title></head>
        <body>
        <p> Hello {name} <br /><br/>
        Congrats. Your account has been created in Digilocker. Here are the details: </p>
        <table>
        <tr><td>Account Address: </td><td><strong>{address}</strong></td></tr>
    """
    msgHtml += "</table>"

    if pr:
        msgHtml += """
        <p><br>PFA the private key. This private key is used to download the document which
        is shared with you in future.<br/>
        """
        msg.attach(
            "pr.key",
            'application/octect-stream',
            pr
        )

    msgHtml += """
        Don't share these credentials with anyone, keep it with you.<br></p>
        <p>Best<br>Digilocker Team</p>
        </body>
        </html>
        """

    msg.html = msgHtml
    msg.subject = "Account Created Successfully"

    return msg


def prepareRequestMail(        
        owner_name, 
        owner_email, 
        requester_email, 
        doc_name, 
        approval_url,
        owner_address,
        requester_address,
        MAIL_SENDER
    ):
    msgHtml = f"""
        <!DOCTYPE html>
        <html>
        <head><title>Approval Request for {doc_name}</title>
        </head>
        <body>
        <p> Hello {owner_name}, <br /> <br />
        The request has been raised by email : {requester_email} 
            ({requester_address}) for your document <strong>{doc_name}</strong>. 
        <br /><br />
        Please click on below button to permit the read access of the owned 
        document.
        <br/>
        <br/>
        <a class = "btn" href="{approval_url}"
            style = "text-decoration: none;
            color: #fff;
            background-color: #26a69a;
            text-align: center;
            letter-spacing: .5px;
            padding: 20px;
            font-size: 14px;
            outline: 0;
            border: none;
            border-radius: 2px;
            line-height: 36px;
            text-transform: uppercase;"
        >
        Click to aproove the request
        </a>
        <br />
        <br />
        <p>Best<br>Digilocker Team</p>
        </body>
        </html>
    """
    msg = Message(
        recipients=[owner_email.strip(),],
        sender = MAIL_SENDER
    )
    msg.html = msgHtml
    msg.subject = f"Read access Request for document: {doc_name} by {requester_email}"
    return msg
    
def prepareAproovedMail(        
        owner_name, 
        owner_email, 
        requester_email, 
        doc_name, 
        approval_url,
        owner_address,
        requester_address,
        MAIL_SENDER
    ):
    msgHtml = f"""
        <!DOCTYPE html>
        <html>
        <head><title>{owner_name} shared document with you</title>
        </head>
        <body>
        <p> Hello {owner_name}, <br /> <br />
        {owner_email} has shared a document {doc_name}  with you. You can now download the document.
        <br /><br />
        Please click on below button to download the document.
        <br/>
        <br/>
        <a class = "btn" href="{approval_url}"
            style = "text-decoration: none;
            color: #fff;
            background-color: #26a69a;
            text-align: center;
            letter-spacing: .5px;
            padding: 20px;
            font-size: 14px;
            outline: 0;
            border: none;
            border-radius: 2px;
            line-height: 36px;
            text-transform: uppercase;"
        >
        Click to Download
        </a>
        <br />
        <br />

        <p>
        On clicking the above link, you will be asked for your private Key
         to download the document.
        </p>
        <br>

        <p>Best<br>Digilocker Team</p>
        </body>
        </html>
    """
    msg = Message(
        recipients=[requester_email.strip(),],
        sender = MAIL_SENDER
    )
    msg.html = msgHtml
    msg.subject = f"{owner_name} shared document with you"
    return msg
    