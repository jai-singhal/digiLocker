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

### Other Dependencies

- Install the Ganache()

## System Design

### Resident Perspective

![Resident](https://i.imgur.com/2Lrcsux.png)


### Requestor Perspective

![Requestor](https://i.imgur.com/QAuXW5V.png)

### Auth Activity digram

![auth](https://i.imgur.com/SjtrkUV.png)

### Document upload and permission Grant Activity digram