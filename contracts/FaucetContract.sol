// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Owned.sol";
import "./Logger.sol";
import "./IFaucet.sol";

contract Faucet is Owned,Logger,IFaucet{
    uint public numOfFunders;
    mapping(address => bool) private fundersMap;
    mapping(uint => address) private funders;
    
    modifier limitWithdraw(uint withdrawAmount){
        require(withdrawAmount<= 100000000000000000, "Cannot withdraw more than 0.1 Ether");
        _;
    }

    receive() external payable{}

    function transferOwnership(address newOwner) external onlyOwner{
        owner = newOwner;
    }

    function emitLog() public pure override returns(bytes32){
        return "Hello World";
    }

    function addFunds() external override payable{
        address _funder = msg.sender;
        if(!fundersMap[_funder]){
            funders[numOfFunders] = _funder;
            fundersMap[_funder] = true;
            numOfFunders++;
        }
            
    }

    function antiWhale() external override payable{}

    function test1() external onlyOwner{}
    function test2() external onlyOwner{} 

    function widthdraw(uint withdrawAmount) external override limitWithdraw(withdrawAmount){ 
        payable(msg.sender).transfer(withdrawAmount);
    }

    // view, view - read only call, no gas fee
    // view - indicates that the function will not alter the storage
    // pure - even more strict, indicate that it wont even read the storage state
    // private - accessible only within the smart contract
    // internal - can be accessible within smart contract and also derived smart contract

    function getFunderAtIndex(uint8 index) external view returns(address){
        return funders[index];
    }

    function getAllFunders() external view returns(address[] memory){
        address[] memory _funders = new address[](numOfFunders);
        for(uint8 i=0; i<numOfFunders; i++){
            _funders[i] = funders[i];
        }
        return _funders;
    }
}