// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract FocusTimerNFT is ERC721, ERC721URIStorage, Ownable, EIP712 {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;
    
    Counters.Counter private _tokenIds;
    
    uint256 public constant SESSIONS_REQUIRED = 3;
    uint256 public constant SESSION_DURATION = 25 minutes;
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Track user sessions and minting eligibility
    mapping(address => uint256) public userCompletedSessions;
    mapping(address => uint256) public userLastSessionTime;
    mapping(address => bool) public hasMinted;
    mapping(bytes32 => bool) public usedSignatures;
    
    // Server signer address for verification
    address public serverSigner;
    
    // Events
    event SessionCompleted(address indexed user, uint256 sessionCount, uint256 timestamp);
    event NFTMinted(address indexed user, uint256 tokenId, uint256 timestamp);
    
    // Struct for signature verification
    struct MintRequest {
        address user;
        uint256 completedSessions;
        uint256 timestamp;
        uint256 nonce;
    }
    
    bytes32 private constant MINT_REQUEST_TYPEHASH = 
        keccak256("MintRequest(address user,uint256 completedSessions,uint256 timestamp,uint256 nonce)");
    
    constructor(
        string memory name,
        string memory symbol,
        address _serverSigner
    ) ERC721(name, symbol) EIP712("FocusTimerNFT", "1") {
        serverSigner = _serverSigner;
    }
    
    /**
     * @dev Record a completed session for the user
     * This can be called by the user after completing a 25-minute session
     */
    function recordSession() external {
        require(
            block.timestamp >= userLastSessionTime[msg.sender] + SESSION_DURATION,
            "Session too soon after last one"
        );
        
        userCompletedSessions[msg.sender]++;
        userLastSessionTime[msg.sender] = block.timestamp;
        
        emit SessionCompleted(msg.sender, userCompletedSessions[msg.sender], block.timestamp);
    }
    
    /**
     * @dev Mint NFT reward using signature verification
     * This prevents abuse by requiring server-signed proof of completed sessions
     */
    function mintReward(
        MintRequest calldata request,
        bytes calldata signature
    ) external {
        require(request.user == msg.sender, "Invalid user");
        require(request.completedSessions >= SESSIONS_REQUIRED, "Insufficient sessions");
        require(!hasMinted[msg.sender], "Already minted");
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        require(block.timestamp <= request.timestamp + 1 hours, "Request expired");
        
        // Verify signature
        bytes32 structHash = keccak256(abi.encode(
            MINT_REQUEST_TYPEHASH,
            request.user,
            request.completedSessions,
            request.timestamp,
            request.nonce
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        require(!usedSignatures[hash], "Signature already used");
        require(hash.recover(signature) == serverSigner, "Invalid signature");
        
        // Mark signature as used and user as minted
        usedSignatures[hash] = true;
        hasMinted[msg.sender] = true;
        
        // Mint NFT
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, generateTokenURI(newTokenId, msg.sender));
        
        emit NFTMinted(msg.sender, newTokenId, block.timestamp);
    }
    
    /**
     * @dev Simple mint function without signature (less secure alternative)
     * Only use this if you don't want server-side verification
     */
    function mintRewardSimple() external {
        require(userCompletedSessions[msg.sender] >= SESSIONS_REQUIRED, "Insufficient sessions");
        require(!hasMinted[msg.sender], "Already minted");
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        
        hasMinted[msg.sender] = true;
        userCompletedSessions[msg.sender] = 0; // Reset sessions
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, generateTokenURI(newTokenId, msg.sender));
        
        emit NFTMinted(msg.sender, newTokenId, block.timestamp);
    }
    
    /**
     * @dev Generate unique token URI for each NFT
     */
    function generateTokenURI(uint256 tokenId, address owner) internal pure returns (string memory) {
        // This would typically point to IPFS or your metadata server
        return string(abi.encodePacked(
            "https://api.focustimer.app/metadata/",
            Strings.toString(tokenId),
            "?owner=",
            Strings.toHexString(uint160(owner), 20)
        ));
    }
    
    /**
     * @dev Check if user can mint NFT
     */
    function canMint(address user) external view returns (bool) {
        return userCompletedSessions[user] >= SESSIONS_REQUIRED && !hasMinted[user];
    }
    
    /**
     * @dev Update server signer address (only owner)
     */
    function setServerSigner(address _serverSigner) external onlyOwner {
        serverSigner = _serverSigner;
    }
    
    /**
     * @dev Reset user's minting eligibility (only owner, for testing)
     */
    function resetUserMinting(address user) external onlyOwner {
        hasMinted[user] = false;
        userCompletedSessions[user] = 0;
    }
    
    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
