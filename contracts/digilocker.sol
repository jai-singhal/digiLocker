pragma solidity ^0.5.0;

contract digiLocker {
    //structures and other variable declrn
    
    struct Document{
        bytes32 docid; //doc id
        string docName;
        uint256 timestamp; //
        bytes32 docHash; //doc hash
    }
    struct sharedDoc{
        bytes32 docid;
        address sharedWith;
        Permission permission;
    }
    struct UserDetails{
        string firstName;
        string lastName;
        string email;
        string contact;
    }
    
    struct User{
        userType utype;
        bool valid;
        UserDetails details;
        address _useraddress;
        bytes32 accessKey; // user master key Hash
        string pubKey; // Public key of user
    }
    
    ///////////////////////-- enums here -- ///////////////////////////////////
    enum userType { Issuer, Resident, Requester, Admin }
    enum Permission {READ, MODIFY}
    
    
    ///////////////////////-- events here -- ///////////////////////////////////
    event registeredUserEvent(string _firstName,
        string _lastName,
        string _email,
        string _contact,
        userType utype,
        address _useraddress,
        bytes32 accessKey,
        string pubKey
    );
    event alreadyRegistred(
        address _useraddress
    );
    event uploadDocumentEvent(string dName, bytes32 docHash, address user_addr);
    event alreadyuploadedDocumentEvent(string dName, bytes32 docHash, address user_addr);
    event sharedDocumentEvent(bytes32 docid, address sharedWith, uint32 permission);
    
    ///////////////////////-- mapping here -- ///////////////////////////////////
    mapping(address => User) registerUsers;
    mapping (address => Document[])  ownerDocuments;
    mapping (address => sharedDoc[])  sharedDocuments;
    
    ///////////////////////-- modifier here -- ///////////////////////////////////
    // modifier isalreadyRegisteredUserModifier(){
    //     if(isalreadyRegisteredUser()){
    //         _;
    //     }
    //     else{
    //         emit alreadyRegistred(msg.sender);
    //     }
    // }

    ///////////////////////-- functions here -- ///////////////////////////////////
    function isalreadyRegisteredUser() public view returns(bool){
        if(registerUsers[msg.sender]._useraddress == 0x0000000000000000000000000000000000000000){
            return false;
        }
        else{
            return true;
        }
    }
    // temp function
    function getUseraccessKey() public view returns(bytes32){
       return (registerUsers[msg.sender].accessKey);
    }
    
    function getRegisteredUser() public view returns(bytes32, address, string memory){
       return (registerUsers[msg.sender].accessKey, 
       registerUsers[msg.sender]._useraddress,
       registerUsers[msg.sender].details.firstName
       );
    }
    
    //register user
    function registerUser(string memory _firstName,
            string memory _lastName,
            string memory _email, uint8 _utype,
            string memory _contact, bytes32 accessKey,
            string memory pubKey) public returns(bool) {
            if (!isalreadyRegisteredUser()){
                UserDetails memory d = UserDetails(_firstName,_lastName, _email, _contact);
                User memory newuser = User(userType(_utype), true, d, 
                    msg.sender, accessKey, pubKey
                );
                registerUsers[msg.sender] = newuser;
                emit registeredUserEvent(_firstName,_lastName,
                _email, _contact, userType(_utype), 
                msg.sender, accessKey, pubKey);
                return true;
            }
            else{
                emit alreadyRegistred(msg.sender);
                return false;
            }
    }
 
    function checkAlreadyUpload(bytes32 docId)public view returns(bool){
        for(uint i = 0; i<ownerDocuments[msg.sender].length; i++)
            if(ownerDocuments[msg.sender][i].docHash == docId)
                return true;
        return false;
    }

    function getDocCountByUserId() public view returns(uint256){
        return ownerDocuments[msg.sender].length;
    }

    function uploadDocument(string memory docName, bytes32 docHash) public{
        bytes32 docid = keccak256(abi.encode(docHash, msg.sender));
        if(!checkAlreadyUpload(docid)){
            Document memory d = Document(docid, docName, now, docHash);
            ownerDocuments[msg.sender].push(d);
            emit uploadDocumentEvent(docName, docHash, msg.sender);
        }// -- Check 
        emit alreadyuploadedDocumentEvent(docName, docHash, msg.sender); 
    }

    function checkAlreadyShared(bytes32 docId, address sharedWith)public view returns(bool){
        for(uint i = 0; i<sharedDocuments[msg.sender].length; i++)
            if(sharedDocuments[msg.sender][i].docid == docId &&
                sharedDocuments[msg.sender][i].sharedWith == sharedWith)
                return true;
            
        return false;
    }

    function shareDocumentwithUser(bytes32 docid, address sharedWith, uint32 permission) public{
        if (!checkAlreadyShared(docid, sharedWith)){
            sharedDoc memory d = sharedDoc(docid, sharedWith, Permission(permission));
            sharedDocuments[msg.sender].push(d);
            emit sharedDocumentEvent(docid,sharedWith, permission);  
        }
    }

    function getTotalSharedDocsByOthers() public view returns(uint256){
        return sharedDocuments[msg.sender].length;
    }
    
    function getOwnerDocInfoByDocId(bytes32 docId)public view returns (string memory, uint256){
        
        for(uint i = 0; i < ownerDocuments[msg.sender].length; i++){
            if(ownerDocuments[msg.sender][i].docid == docId)
                return (ownerDocuments[msg.sender][i].docName,
                    ownerDocuments[msg.sender][i].timestamp
                );
            
        }
    }
    
    // function getSharedDocByDocId(uint256 docId) public view returns(uint256,string docName, Permission){
    //         return(,,);
    // }
    
}