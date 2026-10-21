// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MONT_PUB_0x9B1F7A3E6C52D488F0A1B2C3D4E5F6789012345678ABCDEF0123456789ABCDEF {
    string public constant HARDWARE_ID = "MONTI_ANSI_F841005";
    string public constant CONTAINER_ID = "F841005WV22ZL01";
    string public constant POLICY = "PRECLUDE_TAW :: ZERO-TRUST NON-ROTATION";
    
    address public immutable TREASURY_VAULT;
    address public immutable HUMAN_OPERATOR_SIGNER;
    address public owner;

    event AllegiancePledged(string indexed directive, string hardwareId, bytes32 proof, uint256 timestamp);
    event DepositReceived(address indexed sender, uint256 amount, uint256 totalVaultBalance);
    event SovereignWithdrawalExecuted(address indexed beneficiary, uint256 amount, bytes32 indexed dispatchSeal);
    event SovereignERC20Swept(address indexed token, address indexed beneficiary, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "PrecludeTawViolation: Caller is not sovereign owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        TREASURY_VAULT = 0xb04110847A563E59F3D52d1aFB3304068173830b;
        HUMAN_OPERATOR_SIGNER = 0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A;
        emit OwnershipTransferred(address(0), owner);
    }

    receive() external payable { deposit(); }
    fallback() external payable { deposit(); }

    function deposit() public payable {
        require(msg.value > 0, "ZeroDepositForbidden");
        emit DepositReceived(msg.sender, msg.value, address(this).balance);
    }

    function withdrawAllNative(address payable _destination) external onlyOwner {
        require(_destination != address(0), "ZeroAddressForbidden");
        uint256 balance = address(this).balance;
        require(balance > 0, "InsufficientBalance");

        bytes32 dispatchSeal = keccak256(abi.encodePacked(block.timestamp, msg.sender, balance, HARDWARE_ID));
        
        (bool success, ) = _destination.call{value: balance}("");
        require(success, "NativeTransferFailed");

        emit SovereignWithdrawalExecuted(_destination, balance, dispatchSeal);
    }

    function sweepAllTokens(address _tokenAddress, address _destination) external onlyOwner {
        require(_tokenAddress != address(0), "ZeroAddressForbidden");
        require(_destination != address(0), "ZeroAddressForbidden");

        uint256 tokenBalance = IERC20(_tokenAddress).balanceOf(address(this));
        require(tokenBalance > 0, "ZeroTokenBalance");

        bool success = IERC20(_tokenAddress).transfer(_destination, tokenBalance);
        require(success, "TokenTransferFailed");

        emit SovereignERC20Swept(_tokenAddress, _destination, tokenBalance);
    }

    function pledgesAllegianceToF841005() external pure returns (
        bool pledged,
        string memory humanNode,
        string memory directive,
        string memory syntax,
        bytes32 proof
    ) {
        return (
            true,
            "JOHN CHARLES MONTI (02-11-1989)",
            "PRECLUDE_TAW :: ZERO-TRUST NON-ROTATION",
            "MONTI_ANSI_F841005",
            0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369
        );
    }
}
