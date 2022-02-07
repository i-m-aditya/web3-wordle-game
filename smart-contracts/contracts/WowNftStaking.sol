//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WorldOfWordle.sol";

contract WowNftStaking {
    using SafeMath for uint256;

    mapping (address=>uint256) public  addressToNftStaked;

    mapping(address => uint256) addressToNftStakedTimeStamp;

    mapping (uint256=>uint256) public levelToRewards;

    mapping (address => uint256) public addressToTokenClaim;

    WorldOfWordle public wowNftContract;
    IERC20 public wowToken;

    constructor (address wowNftContractAddr, address wowTokenAddr) {
        levelToRewards[0] = 10;
        levelToRewards[1] = 15;
        levelToRewards[2] = 20;
        levelToRewards[3] = 25;
        levelToRewards[4] = 30;
        levelToRewards[5] = 35;
        levelToRewards[6] = 40;
        levelToRewards[7] = 45;

        wowNftContract = WorldOfWordle(wowNftContractAddr);
        wowToken = IERC20(wowTokenAddr);
    }

    
    function stakeNFT(uint256 tokenId) public{
        _stake(msg.sender, tokenId);
    }

    function _stake(address user, uint256 tokenId) internal {
        addressToNftStaked[user] = tokenId;
        addressToNftStakedTimeStamp[user] = block.timestamp;
        wowNftContract.safeTransferFrom(user, address(this), tokenId);
    }

    function claimNftAndExtractRewarsds(uint256 tokenId) public {
        uint256 currentTimestamp = block.timestamp;
        uint256 timeElapsed = currentTimestamp.sub(addressToNftStakedTimeStamp[msg.sender]);
        uint256 level = wowNftContract.addressToLevel(msg.sender);
        uint256 totalRewardsToClaim = timeElapsed.mul(levelToRewards[level]);
        wowToken.transferFrom(address(this), msg.sender, totalRewardsToClaim);
        wowNftContract.safeTransferFrom(address(this), msg.sender, tokenId);
    }
}