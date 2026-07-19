// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ArcLearningLog {
  error NotOwner(address caller);

  address public owner;
  string public message;
  uint256 public updatedAt;

  event MessageUpdated(string message, uint256 updatedAt);

  constructor(string memory initialMessage) {
    owner = msg.sender;
    _setMessage(initialMessage);
  }

  function updateMessage(string calldata newMessage) external {
    if (msg.sender != owner) {
      revert NotOwner(msg.sender);
    }

    _setMessage(newMessage);
  }

  function _setMessage(string memory newMessage) private {
    message = newMessage;
    updatedAt = block.timestamp;
    emit MessageUpdated(newMessage, block.timestamp);
  }
}
