// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract BreenBuilderNFT is ERC721, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1000;

    uint256 public nextTokenId;

    mapping(address => bool) public hasMinted;

    constructor()
        ERC721("Breen Builder NFT", "BBN")
        Ownable(msg.sender)
    {}

    function mint() external whenNotPaused {
        require(
            !hasMinted[msg.sender],
            "Wallet already minted"
        );

        require(
            nextTokenId < MAX_SUPPLY,
            "Max supply reached"
        );

        uint256 tokenId = nextTokenId;

        hasMinted[msg.sender] = true;
        nextTokenId++;

        _safeMint(msg.sender, tokenId);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}