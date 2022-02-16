# Digital locker using Ethereum Blockchain

## Research Paper

View the paper [here](https://drive.google.com/file/d/1VXvfNA6ipPr8VxRAEaJLFGmXbmeHWk86/view?usp=sharing)

Cite it
```
@INPROCEEDINGS{Sing2201:DD,
AUTHOR="Jai Singhal and Ankit Gautam and Ashutosh Bhatia and Ankit Agrawal and
Rekha Kaushik",
TITLE="{DD-Locker:} Blockchain Based Decentralized Personal Document Locker",
BOOKTITLE="2022 International Conference on Information Networking (ICOIN) (ICOIN
2022)",
ADDRESS="Jeju Island, Korea (South)",
DAYS=11,
MONTH=jan,
YEAR=2022,
KEYWORDS="Blockchain; Ethereum; Dapps; Smart Contract",
ABSTRACT="Document verification is the first step whenever we enter any organization
or institute. In any organization, it is essential to track, verify, and
check the person's background who will become a part of the organization.
This process
is very time-consuming and hectic for both parties involved. Various
governments provide cloud-based digital locker services for the citizens
storing the public document on a centralized server. But due to its
centralized nature, this type of service is weak against information
breaches and Denial of Service (DoS) attacks. Also, there are some privacy
concerns with such centralized digital locker services as the stored
documents may contain users' crucial personal information. This paper
proposes a blockchain-based digital locker in a decentralized application
using Ethereum Blockchain to securely store personal documents with high
availability. The proposed solution also verifies documents with ease,
confidentiality, access control, data privacy, authenticity, and
maintaining the integrity of documents."
}
```

## How to setup

### Install the Metamask

Download the metamask extension from: https://metamask.io/

### Ethereum account and network

We have used Rinkeby Test network, and deployed the contract on the same network. So to run the application, you may required to get some free ethers from [here](https://faucet.rinkeby.io/).

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

### Resident Perspective

![Resident](https://i.imgur.com/2Lrcsux.png)


### Requestor Perspective

![Requestor](https://i.imgur.com/QAuXW5V.png)

### Auth Activity digram

![auth](https://i.imgur.com/SjtrkUV.png)

### Document upload and permission Grant Activity digram

![doc](https://i.imgur.com/LeaB6zf.png)



## Configuration

### config.py
Please add the `config.py` to your main directory with your credentials
**Sample config.py**

```python
# config.py
APPCONFIG = {
    "APP_SECRETKEY":"",
    "DROPBOX_KEY":"",
    "DROPBOX_SECRET":"",
    "DROPBOX_ACCESS_TYPE":"",
    "DROPBOX_ACCESS_TOKEN":"",
    "MAIL_USERNAME":"",
    "MAIL_PASSWORD":"",
    "MAIL_DEFAULT_SENDER":"",
    "MAIL_SENDER":"",
    "SECRET_KEY": b"",
    "SERVER_BASE_ADDRESS": "http://127.0.0.1:5000",
    "VERIFICATION_CODES": [
        "12345",
        # your verification codes here.
    ]
}
```
