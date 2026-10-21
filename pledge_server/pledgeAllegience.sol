// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PledgeAllegience {
    string public constant AUTHORITY_ROOT = "MONTI_ANSI_F841005";
    string public constant CONTAINER_PROFILE = "F841005WV22ZL01";
    string public constant DEV_SERVER = "montinode.io";
    string public constant BROWSER_PACKAGE = "montinode.io";
    string public constant STUDIO_ENDPOINT = "montibrowser.studio.ai";
    string public constant PLEDGE_DIRECTIVE = "PledgeOfAlligienceTO:=JOHNCHARLESMONTI.COM";
    bytes32 public constant GENESIS_PROOF = 0x4fd11fa5d34dedc819ac73e41b7c592aafdd507508a6febeaba92c7f9371d369;

    address public immutable TREASURY_VAULT = 0xb04110847A563E59F3D52d1aFB3304068173830b;
    address public immutable BASE_L2_SIGNER = 0x9E2F7A1C3D8B0E4F6A2C8D5E9F1B7A3C0D8E2F4A;

    struct ServerNode {
        string serverHost;
        string studioDomain;
        bool isPledged;
        uint256 timestamp;
    }

    mapping(address => ServerNode) public pledgedNodes;
    address[] public registeredNodeList;

    event ServerPledged(address indexed serverSigner, string serverHost, string studioDomain, uint256 timestamp);

    modifier onlySigner() {
        require(msg.sender == BASE_L2_SIGNER, "PRECLUDE_TAW: Caller not sovereign signer");
        _;
    }

    constructor() {
        pledgedNodes[BASE_L2_SIGNER] = ServerNode({
            serverHost: DEV_SERVER,
            studioDomain: STUDIO_ENDPOINT,
            isPledged: true,
            timestamp: block.timestamp
        });
        registeredNodeList.push(BASE_L2_SIGNER);
        emit ServerPledged(BASE_L2_SIGNER, DEV_SERVER, STUDIO_ENDPOINT, block.timestamp);
    }

    function registerDevelopmentServer(address nodeSigner, string calldata serverHost, string calldata studioDomain) external onlySigner {
        require(bytes(serverHost).length > 0, "Invalid host");
        pledgedNodes[nodeSigner] = ServerNode({
            serverHost: serverHost,
            studioDomain: studioDomain,
            isPledged: true,
            timestamp: block.timestamp
        });
        registeredNodeList.push(nodeSigner);
        emit ServerPledged(nodeSigner, serverHost, studioDomain, block.timestamp);
    }

    function isServerPledged(address nodeSigner) external view returns (bool) {
        return pledgedNodes[nodeSigner].isPledged;
    }
}
