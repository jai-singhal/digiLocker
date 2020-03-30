## Resources

## Building etherium dapps with metamask[*]

- https://medium.com/crowdbotics/building-ethereum-dapps-with-meta-mask-9bd0685dfd57

## Setup local ganache and private network[*]
- https://medium.com/@tricialobo/testing-smart-contracts-with-remix-ganache-and-metamask-a62d5fe525a1

### How to generate multiple keys

- https://crypto.stackexchange.com/questions/76588/multiple-aes-key-derivation-from-a-master-key
- https://pycryptodome.readthedocs.io/en/latest/src/protocol/kdf.html

### How to login using metamask

- http://www.programmersought.com/article/6535156845/

## Other resources

- https://ethereum.stackexchange.com/questions/31355/storing-and-passing-encrypted-data-to-another-owner

## Discussion with mentor

1. Server will authenticate the requester using IDA
2. Relay the request to the Resident
3. Use OTP based authenticacation, directly from the requester. 
4. Encrypt the document key with the Identity of the requester. 
5. Requester has the private kay correponding to that ID, therefore it will be able to decrypt the document
