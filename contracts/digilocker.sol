pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;


contract digiLocker {
    //structures and other variable declrn
    
    struct Document{
        bytes32 docid; //doc id
        string docName;
        string timestamp; //
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
    uint usercount = 0;
    address[] _glbluseraddress;
    ///////////////////////-- enums here -- ///////////////////////////////////
    enum userType { Issuer, Resident, Requester, Admin }
    enum Permission {READ, MODIFY}
    
    
    ///////////////////////-- events here -- ///////////////////////////////////
    event registeredUserEvent(string _email,userType utype,address _useraddress);
    event uploadDocumentEvent(bytes32 docid, bytes32 docHash, address user_addr);
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
                User memory newuser = User(
                    userType(_utype), true, d, 
                    msg.sender, accessKey, pubKey
                );
                registerUsers[msg.sender] = newuser;
                emit registeredUserEvent(_email, userType(_utype), msg.sender);
                _glbluseraddress.push(msg.sender);
                usercount++;
                return true;
            }
            else{
                return false;
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

    function uploadDocument(string memory docName, bytes32 docHash, string memory timestamp) public{
        bytes32 docid = keccak256(abi.encode(docHash, msg.sender));
        if(!checkAlreadyUpload(docid)){
            Document memory d = Document(docid, docName, timestamp, docHash );
            ownerDocuments[msg.sender].push(d);
            emit uploadDocumentEvent(docid, docHash, msg.sender);
        }// -- Check 
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
            emit sharedDocumentEvent(docid, sharedWith, permission);  
        }
    }

    function getTotalSharedDocsByOthers() public view returns(uint256){
        return sharedDocuments[msg.sender].length;
    }
    
    function getOwnerDocInfoByDocId(bytes32 docId)public view returns (string memory, string memory){
        
        for(uint i = 0; i < ownerDocuments[msg.sender].length; i++){
            if(ownerDocuments[msg.sender][i].docid == docId)
                return (ownerDocuments[msg.sender][i].docName,
                    ownerDocuments[msg.sender][i].timestamp
                );
            
        }   
    }
    
    function bytes32ToStr(bytes32 _bytes32) public pure returns (string memory) {

    // string memory str = string(_bytes32);
    // TypeError: Explicit type conversion not allowed from "bytes32" to "string storage pointer"
    // thus we should fist convert bytes32 to bytes (to dynamically-sized byte array)

        bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
        }

    
    function getOwnerDocumetList()public view returns (string[] memory, string[] memory) {
        return getDocumetList(msg.sender);
    }
    
    function getDocumetList(address _useradd)public view returns (string[] memory, string[] memory) {

      string[] memory _docName = new string[](ownerDocuments[_useradd].length);
      string[] memory _timestamp = new string[](ownerDocuments[_useradd].length);
      
      for(uint i=0;i<ownerDocuments[_useradd].length;i++){
         _timestamp[i] = ownerDocuments[_useradd][i].timestamp;
         _docName[i] = ownerDocuments[_useradd][i].docName;
   
      }
      
      return (_docName,_timestamp);
    }
    
    
    function getDocumentListbyDocId(bytes32 _docId) public view returns(
        bytes32, 
        string memory, 
        string memory, 
        bytes32, 
        string memory, 
        string memory, 
        string memory, 
        string memory){
        for(uint i=0;i<usercount;i++){
            for(uint j=0;j < ownerDocuments[_glbluseraddress[i]].length;j++){
                
                if(ownerDocuments[_glbluseraddress[i]][j].docid == _docId)
                    
                    return (
                        ownerDocuments[_glbluseraddress[i]][j].docid,
                        ownerDocuments[_glbluseraddress[i]][j].docName,
                        ownerDocuments[_glbluseraddress[i]][j].timestamp,
                        ownerDocuments[_glbluseraddress[i]][j].docHash,
                        registerUsers[_glbluseraddress[i]].details.firstName,
                        registerUsers[_glbluseraddress[i]].details.email,
                        registerUsers[_glbluseraddress[i]].details.lastName,
                        registerUsers[_glbluseraddress[i]].details.contact
                    );
                
            }
            
        }
        
    }
}