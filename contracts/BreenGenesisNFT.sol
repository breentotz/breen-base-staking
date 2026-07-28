// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BreenGenesisNFT is ERC721, Ownable {

    uint256 public nextTokenId;

    constructor()
        ERC721("Breen Genesis NFT", "BGN")
        Ownable(msg.sender)
    {}

    function mint(address to) external onlyOwner {
        _safeMint(to, nextTokenId);
        nextTokenId++;
    }

    function tokensOfOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 balance = balanceOf(owner);

        uint256[] memory ids = new uint256[](balance);

        uint256 counter = 0;

        for (uint256 i = 0; i < nextTokenId; i++) {
            if (_ownerOf(i) == owner) {
                ids[counter] = i;
                counter++;
            }
        }

        return ids;
    }
}