// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract OracleContract is ERC721 {
    
    address public oracleAddress;
    bool private canGraduate;
    uint256 private _tokenIdCounter;
    event tokenMinted(uint256 tokenId);

    constructor (address _oracleAddress) ERC721("Degree", "DNFT") {
        oracleAddress = _oracleAddress;
        canGraduate = false;
    }

    modifier onlyOracle() {
        require (oracleAddress == msg.sender, "Not oracle adress");
        _;
    }

    function graduationCheck(bool result) public onlyOracle {
        if (result) {
            canGraduate = true;
        }
    }

    function hasToken(address _studentAddress) public onlyOracle {
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (_ownerOf(i) == _studentAddress) {
                emit tokenMinted(i);
            }
        }
        emit tokenMinted(0);
    }

    function safeMint(address _studentAddress) public onlyOracle {
        require (canGraduate, "Hasn't graduated");
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(_studentAddress, newTokenId);
        canGraduate = false;
        emit tokenMinted(newTokenId);
    }
}