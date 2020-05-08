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

- ~~ Display all the uploaded document by user address~~

- ~~ Searching user/doc: Two different forms with 1 input each. ~~
    - ~~ Search by doc id:: Gets document info. ~~
    - ~~ Search by user id:: Get document names, date, doc id of all docs uploaded by user ~~

- Create a function in solidify that check if user with address exists or not

- Create a function in solidify that check if doc with id exists or not

- Get the number of verifer that verified that document

- Accessing Document permission:
 - Add button with each document(s) which should be responsible for making an POST call to python server,
    sending, requesting useraddress, docid.



These are tasks we have to do in future