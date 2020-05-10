# Digital locker using Ethereum Blockchain

## How to setup

### Clone repository

```powershell
git clone https://github.com/jai-singhal/digiLocker

# cd to digilocker
cd digiLocker
```

### create virtualenv

```powershell
pip install virtualenv

# create virtualenv in digilocker dir
virtualenv .

# activate the virtualenv
./Scripts/activate
```

### Install required packages

```powershell
pip install -r requirements.txt
```

### Run the server
```powershell
python main.py
```

## System Design

### Login

![doc-upload](https://i.imgur.com/mC79hzC.png)


### Document uploading

![doc-upload](https://i.imgur.com/bwbkliL.png)


## Todos

### Ankit

Soldity functions
1. Get the index of doc_id in array.


## /aproove/doc
 input from user: masterkey

 params(fetched from blockchain): 
 	public key of requester(fetched from blockchain), doc_no(why? => modulo, to get the approprate key from PKBDF2)

Functionality:
- encrypt masterkey with public key of requester.(opposite of encrytion std.)
- Send the mail to requester with following params
	- ecrypted masterkey
	- doc id,
	- doc name
	- owner name
	- requester email, name, adddress

Requestor will get the email, 
		WITH URL params( 
		requester_address
		docid
		doc_name
		ecrypted masterkey
		owner_address
		doc hash
	)

## /aprooved/doc/?{params}

- Ask requester its private key(why? to decrypt the master key doc key)
- Compare doc hash with the blockchain doc hash
- Decrypt the encrypted doc
- Download the document
- Doc location = BASE_URL/{{owner_address}}/{{doc_name}}.


## Other
- Accessing Document permission:
 - Add button with each document(s) which should be responsible for making an POST call to python server,
    sending, requesting useraddress, docid.



These are tasks we have to do in future