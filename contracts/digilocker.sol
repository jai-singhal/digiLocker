pragma solidity ^0.5.0;

contract digiLocker {
    //structures and other variable declrn
    
    struct Document{
        bytes32 docid; //doc id
        string docName;
        uint256 timestamp; //
        bytes32 docHash; //doc hash
        bytes32 accessKey; // user public key 
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
        uint256 timestamp;
        userType utype;
        bool valid;
        UserDetails details;
        address _useraddress;
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
        address _useraddress
    );
    event alreadyRegistred(
        address _useraddress
    );
    event uploadDocumentEvent(string dName,bytes32 accessKey, bytes32 docHash, address user_addr);
    event alreadyuploadedDocumentEvent(string dName,bytes32 accessKey, bytes32 docHash, address user_addr);
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
        if(registerUsers[msg.sender].valid == false){
            return false;
        }
        else{
            return true;
        }
    }
    // temp function
    function getRegisteredUser() public view returns(uint256, address){
       return (registerUsers[msg.sender].timestamp, msg.sender);
    }
    //register user
    function registerUser(string memory _firstName,
            string memory _lastName,
            string memory _email,
            uint8 _utype,
            string memory _contact) public  {
            if (!isalreadyRegisteredUser()){
                UserDetails memory d = UserDetails(_firstName,_lastName, _email, _contact);
               
                User memory newuser = User(now, userType(_utype), true, d, msg.sender);
                registerUsers[msg.sender] = newuser;
                emit registeredUserEvent(_firstName,_lastName,_email, _contact, userType(_utype), msg.sender);
            }
            else{
                emit alreadyRegistred(msg.sender);
            }
    }
 
    function checkAlreadyUpload(bytes32 docId)public view returns(bool){
        for(uint i = 0; i<ownerDocuments[msg.sender].length; i++)
            if(ownerDocuments[msg.sender][i].docid == docId)
                return true;
        return false;
    }

    function getDocCountByUserId() public view returns(uint256){
        return ownerDocuments[msg.sender].length;
    }

    function uploadDocument(string memory docName, bytes32 accessKey, bytes32 docHash) public{
        bytes32 docid = keccak256(abi.encode(docHash, msg.sender));
        
        if(!checkAlreadyUpload(docid)){
            Document memory d = Document(docid, docName, now, docHash, accessKey);
            ownerDocuments[msg.sender].push(d);
            
            emit uploadDocumentEvent(docName, accessKey, docHash, msg.sender);            
        }// -- Check 
        emit alreadyuploadedDocumentEvent(docName, accessKey, docHash, msg.sender); 
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