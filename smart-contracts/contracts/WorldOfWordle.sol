//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Wordle.sol";

contract WorldOfWordle is ERC721, ERC721Enumerable, Ownable {
    using SafeMath for uint256;

    uint256 public tokenId;


    uint256 public DEFAULT_REWARD = 10000000000000000000;

    mapping (uint256=>string) public tokenIdToTokenUri;

    mapping (address => uint256) public addressToTokenId;

    mapping (address => uint256) public addressToLevel;
    IERC20 public wowToken;

    constructor(address wowTokenAddr) ERC721("World Of Wordle", "WOW") {
        tokenId = 0;
        wowToken = IERC20(wowTokenAddr);
    }

    function mint(string memory tokenUri_, address to_) public {
        if(addressToTokenId[to_] != 0) {
            _burn(addressToTokenId[to_]);
            addressToTokenId[to_] = 0;
        }
        _safeMint(to_, tokenId);

        wowToken.transferFrom(address(this), to_, DEFAULT_REWARD);
        addressToTokenId[to_] = tokenId;
        addressToLevel[to_] = addressToLevel[to_] + 1;
        tokenIdToTokenUri[tokenId] = tokenUri_;
        tokenId = tokenId.add(1);
    }

    function tokenURI(uint256 tokenId_) public view override returns (string memory) {
        return tokenIdToTokenUri[tokenId_];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId_)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId_);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}