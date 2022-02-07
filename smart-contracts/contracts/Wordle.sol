//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wordle is ERC20, Ownable {

    using SafeMath for uint256;
    constructor () ERC20("Wordle", "WOW") {
        uint256 totalSupply = 1000000000000000000000000000;
        _mint(address(0x5c679543E519eAcD7F8f8D15Fd15F9F9D77829dF), totalSupply);
        _mint(address(this), totalSupply);
    }

}