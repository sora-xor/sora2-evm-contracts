## Testing Scenarios

### Initial Setup

1. **Deploy the `BridgeWrapper` contract:**
   - Parameters:
     - `_bridgeAddress`: The address of the bridge contract.
     - `initialAdmin`: The address of the initial admin.

### Admin Management

1. **Add an Admin:**
   - Call `addAdmin` function.
   - Parameters:
     - `admin`: The address of the admin to be added.
   - **Valid Case:**
     - Adding a new admin with a valid address.
     - Expected Behavior: 
        -`AdminUpdated` event with `isAdded` set to `true`.
        - The `admins` mapping should reflect the new admin.
   - **Invalid Case:**
     - Adding an admin with address `0x0`.
     - Expected Behavior: Revert with `InvalidAdminAddress`.
   - **Duplicate Case:**
     - Adding an admin that already exists.
     - Expected Behavior: Revert with `AdminAlreadyExists`.

2. **Remove an Admin:**
   - Call `removeAdmin` function.
   - Parameters:
     - `admin`: The address of the admin to be removed.
   - **Valid Case:**
     - Removing an existing admin.
     - Expected Behavior: 
        - `AdminUpdated` event with `isAdded` set to `false`.
        - The `admins` mapping should no longer reflect the removed admin.
   - **Invalid Case:**
     - Removing an admin with address `0x0`.
     - Expected Behavior: Revert with `InvalidAdminAddress`.
   - **Non-Existent Case:**
     - Removing an admin that does not exist.
     - Expected Behavior: Revert with `AdminDoesNotExist`.
   - **Last Admin Case:**
     - Removing the last remaining admin.
     - Expected Behavior: Revert with `CannotRemoveLastAdmin`.

### Asset Management

3. **Receive and Distribute:**
   - Call `receiveAndDistribute` function.
   - Parameters:
     - `encodedData`: Encoded data containing receipt details.
     - `recipients`: Array of addresses to which token or ETH should be transferred.
     - `amounts`: Array of token or ETH amounts to be transferred to the recipients.
   - **Valid Case:**
     - Properly formatted `encodedData` with valid recipients and amounts.
     - Expected Behavior: 
        - The `AssetsReceived` event should be emitted.
        - The `AssetsDistributed` event should be emitted.
        - The recipients should receive the specified amounts.
   - **Zero Amount Case:**
     - `encodedData` with zero amount.
     - Expected Behavior: Revert with `InvalidDistributionAmount`.
   - **Length Mismatch Case:**
     - Different lengths of `recipients` and `amounts`.
     - Expected Behavior: Revert with `ArrayLengthMismatch`.

4. **Receive from Wallet and Distribute:**
   - Call `receiveFromWalletAndDistribute` function.
   - Parameters:
     - `tokenAddress`: Address of the token to be transferred (use address(0) for Ether).
     - `amount`: Amount of tokens or Ether to be received.
     - `recipients`: Array of addresses to which token or Ether should be transferred.
     - `amounts`: Array of token or Ether amounts to be transferred to the recipients.
   - **Valid Ether Case:**
     - Sending Ether with valid recipients and amounts.
     - Expected Behavior: 
        - The `AssetsReceived` event should be emitted.
        - The `AssetsDistributed` event should be emitted.
        - The recipients should receive the specified amounts.
   - **Valid ERC20 Case:**
     - Sending ERC20 tokens with valid recipients and amounts.
     - Expected Behavior: 
        - The `AssetsReceived` event should be emitted.
        - The `AssetsDistributed` event should be emitted.
        - The recipients should receive the specified amounts.
   - **Mismatch Ether Case:**
     - Sending Ether with `msg.value` not matching `amount`.
     - Expected Behavior: Revert with `InvalidDistributionAmount`.
   - **Length Mismatch Case:**
     - Different lengths of `recipients` and `amounts` arrays.
     - Expected Behavior: Revert with `ArrayLengthMismatch`.

5. **Sweep Assets:**
   - **Valid Ether Sweep:**
     - Sweeping Ether to a valid recipient.
     - Expected Behavior: Recipient receives Ether.
   - **Valid ERC20 Sweep:**
     - Sweeping ERC20 tokens to a valid recipient.
     - Expected Behavior: Recipient receives tokens.
   - **Invalid Address Case:**
     - Sweeping to address `0x0`.
     - Expected Behavior: Revert with `SendEtherFailed` or token transfer failure.

### Token Information

6. **Get Sidechain Token ID:**
   - Call `getSidechainTokenId` function.
   - Parameters:
     - `tokenAddress`: Address of the Ethereum token.
   - **Valid Token Case:**
     - Querying sidechain ID for a valid token.
     - Expected Behavior: Return valid sidechain ID.
   - **Invalid Token Case:**
     - Querying sidechain ID for an invalid token.
     - Expected Behavior: Return zero or revert (depending on implementation).

7. **Get Sidechain Token Address:**
   - Call `getSidechainTokenAddress` function.
   - Parameters:
     - `sidechainId`: The ID of the sidechain token.
   - **Valid ID Case:**
     - Querying Ethereum address for a valid sidechain ID.
     - Expected Behavior: Return valid Ethereum address.
   - **Invalid ID Case:**
     - Querying Ethereum address for an invalid sidechain ID.
     - Expected Behavior: Return zero or revert (depending on implementation).

### Edge Cases and Security Tests

8. **Reentrancy Attack:**
   - **Attack Attempt:**
     - Attempting a reentrancy attack on functions like `receiveAndDistribute` and `receiveFromWalletAndDistribute`.
     - Expected Behavior: Reentrancy protection should prevent the attack.

9. **Direct Ether Transfer:**
    - **Direct Transfer:**
      - Sending Ether directly to the contract.
      - Expected Behavior: Revert with `Direct Ether transfers are not allowed` error message.

10. **Fallback Function:**
    - **Invalid Function Call:**
      - Calling a non-existent function.
      - Expected Behavior: Revert with `Fallback function called: function does not exist` error message.

### Performance and Stress Testing

12. **High Volume Distribution:**
    - **Large Number of Recipients:**
      - Testing `receiveAndDistribute` and `receiveFromWalletAndDistribute` with a large number of recipients.
      - Expected Behavior: Contract should handle the operation without running out of gas.

13. **Large Token Amounts:**
    - **High Value Transactions:**
      - Testing with large token amounts.
      - Expected Behavior: Correct handling without overflow issues.

---

## Additional Notes

- Test the admin functionalities thoroughly to ensure that only admins can perform restricted operations.
- Verify event emissions for each function call to ensure proper logging of actions.
- Consider edge cases and scenarios where the contract might fail or revert to ensure comprehensive testing coverage.
