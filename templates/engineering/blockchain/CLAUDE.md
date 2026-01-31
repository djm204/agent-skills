# Blockchain Development Guide

Staff-level guidelines for blockchain and Web3 development. This guide covers smart contract development, DeFi protocols, and decentralized application architecture.

---

## Overview

This guide applies to:

- Smart contract development (Solidity, Vyper)
- DeFi protocols (AMMs, lending, yield strategies)
- Token implementations (ERC-20, ERC-721, ERC-1155, ERC-4626)
- Web3 frontend applications
- Cross-chain and L2 integrations

### Key Principles

1. **Security Is Non-Negotiable** - Immutable code handling real value
2. **Gas Efficiency Matters** - Users pay for every operation
3. **Composability Is King** - Build for the ecosystem
4. **Defense in Depth** - Multiple layers of protection

### Technology Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity 0.8.x, OpenZeppelin |
| Testing | Foundry (Forge), Hardhat |
| Static Analysis | Slither, Mythril |
| Web3 Frontend | Viem, Wagmi, React |
| Wallet Connection | ConnectKit, RainbowKit |
| Oracles | Chainlink, Uniswap TWAP |

---

## Smart Contract Patterns

### File Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// Imports (interfaces → libraries → contracts)
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Protocol is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // State: constants → immutables → storage
    uint256 public constant MAX_FEE = 1000;
    address public immutable i_owner;
    uint256 private s_totalDeposits;

    // Events
    event Deposited(address indexed user, uint256 amount);

    // Errors
    error InsufficientBalance(uint256 requested, uint256 available);

    // External → Public → Internal → Private → View/Pure
}
```

### Checks-Effects-Interactions Pattern

```solidity
function withdraw(uint256 amount) external nonReentrant {
    // 1. CHECKS
    if (s_balances[msg.sender] < amount) {
        revert InsufficientBalance(amount, s_balances[msg.sender]);
    }

    // 2. EFFECTS
    s_balances[msg.sender] -= amount;

    // 3. INTERACTIONS
    IERC20(token).safeTransfer(msg.sender, amount);
}
```

### Input Validation

```solidity
function deposit(address token, uint256 amount, address recipient) external {
    if (token == address(0)) revert ZeroAddress();
    if (amount == 0) revert ZeroAmount();
    if (!s_allowedTokens[token]) revert TokenNotAllowed(token);

    IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    s_balances[recipient] += amount;
}
```

---

## Security Checklist

### Attack Vectors to Test

| Attack | Prevention |
|--------|------------|
| Reentrancy | CEI pattern + ReentrancyGuard |
| Flash Loan Manipulation | TWAP oracles, not spot prices |
| Front-Running/MEV | Commit-reveal, slippage protection |
| Integer Overflow | Solidity 0.8+ (careful with unchecked) |
| Access Control | Role-based access, no tx.origin |
| DoS | Pull over push, pagination |

### Before Deployment

- [ ] Slither reports zero high/medium findings
- [ ] Fuzz tests with >100k runs
- [ ] Invariant tests for protocol properties
- [ ] Mainnet fork tests pass
- [ ] External audit completed
- [ ] Bug bounty program ready

---

## Gas Optimization

### Storage Optimization

```solidity
// Pack variables into 32-byte slots
struct UserData {
    uint128 balance;     // 16 bytes
    uint64 lastUpdate;   // 8 bytes
    uint32 nonce;        // 4 bytes
    bool isActive;       // 1 byte
    // Total: 29 bytes = 1 slot
}

// Cache storage in memory
function process() external {
    uint256 counter = s_counter;  // Read once
    for (uint256 i = 0; i < 10;) {
        counter++;
        unchecked { ++i; }
    }
    s_counter = counter;  // Write once
}
```

### Calldata vs Memory

```solidity
// Bad: Copies to memory
function processBad(uint256[] memory data) external { }

// Good: Read from calldata
function processGood(uint256[] calldata data) external { }
```

### Custom Errors

```solidity
// Bad: String storage is expensive
require(balance >= amount, "Insufficient balance");

// Good: Custom errors are cheaper
error InsufficientBalance(uint256 requested, uint256 available);
if (balance < amount) revert InsufficientBalance(amount, balance);
```

---

## Testing Strategy

### Test Types

| Type | Coverage | Purpose |
|------|----------|---------|
| Unit | 100% branches | Individual functions |
| Fuzz | 10,000+ runs | Edge cases |
| Invariant | 10,000+ calls | System properties |
| Fork | Critical paths | Real integrations |

### Foundry Test Example

```solidity
function testFuzz_deposit(uint256 amount) public {
    amount = bound(amount, 1, INITIAL_BALANCE);

    vm.prank(user);
    vault.deposit(amount, user);

    assertEq(vault.balanceOf(user), amount);
}

function invariant_noShareInflation() public view {
    assertGe(token.balanceOf(address(vault)), vault.totalSupply());
}
```

### Useful Cheatcodes

```solidity
vm.prank(user);           // Next call from user
vm.warp(block.timestamp + 1 days);  // Time travel
deal(address(token), user, amount);  // Set balance
vm.expectRevert(Error.selector);     // Expect revert
```

---

## Web3 Frontend Integration

### Wagmi + Viem Setup

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

export function useDeposit() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = (amount: bigint) => {
    writeContract({
      address: VAULT_ADDRESS,
      abi: vaultAbi,
      functionName: 'deposit',
      args: [amount],
    });
  };

  return { deposit, isPending, isLoading, isSuccess };
}
```

### Transaction States

```typescript
type TransactionState =
  | 'idle'        // No transaction
  | 'pending'     // Waiting for wallet
  | 'confirming'  // In mempool
  | 'confirmed'   // Success
  | 'failed';     // Reverted

// Always show clear feedback for each state
```

### Error Handling

```typescript
import { ContractFunctionRevertedError } from 'viem';

function parseError(error: unknown): string {
  if (error instanceof ContractFunctionRevertedError) {
    const errorName = error.data?.errorName ?? 'Unknown';
    const messages: Record<string, string> = {
      InsufficientBalance: "You don't have enough balance",
      SlippageExceeded: 'Price moved too much, try again',
    };
    return messages[errorName] ?? errorName;
  }
  return 'An unexpected error occurred';
}
```

---

## DeFi Patterns

### Token Standards

| Standard | Use Case |
|----------|----------|
| ERC-20 | Fungible tokens (currencies, rewards) |
| ERC-721 | NFTs (unique items) |
| ERC-1155 | Multi-token (gaming, bulk NFTs) |
| ERC-4626 | Yield-bearing vaults |

### MEV Protection

```solidity
function swap(
    uint256 amountIn,
    uint256 minAmountOut,  // Slippage protection
    uint256 deadline       // Expiry protection
) external {
    if (block.timestamp > deadline) revert Expired();
    uint256 amountOut = _calculateOutput(amountIn);
    if (amountOut < minAmountOut) revert SlippageExceeded();
    _executeSwap(amountIn, amountOut);
}
```

### Oracle Best Practices

```solidity
// Always validate oracle data
function getPrice(address feed) public view returns (uint256) {
    (, int256 price,, uint256 updatedAt,) = AggregatorV3Interface(feed).latestRoundData();

    // Staleness check
    if (block.timestamp - updatedAt > 1 hours) revert StalePrice();

    // Sanity check
    if (price <= 0) revert InvalidPrice();

    return uint256(price);
}
```

---

## Definition of Done

### Smart Contract

- [ ] All functions have NatSpec documentation
- [ ] Unit tests cover all branches (>95% coverage)
- [ ] Fuzz tests for external functions
- [ ] Invariant tests for protocol properties
- [ ] Slither: zero high/medium findings
- [ ] Gas benchmarks documented
- [ ] Mainnet fork tests pass
- [ ] External audit (for mainnet)

### Web3 Frontend

- [ ] Works with multiple wallet types
- [ ] Handles all transaction states
- [ ] Meaningful error messages
- [ ] Network switching works
- [ ] Mobile wallet compatible
- [ ] Transaction simulation before signing

---

## Common Pitfalls

### 1. Trusting Spot Prices

```solidity
// Bad: Manipulable in same transaction
uint256 price = amm.getSpotPrice();

// Good: Resistant to manipulation
uint256 price = oracle.getTwapPrice(1 hours);
```

### 2. Missing Slippage Protection

```solidity
// Bad: No protection
function swap(uint256 amountIn) external;

// Good: User specifies minimum acceptable output
function swap(uint256 amountIn, uint256 minAmountOut, uint256 deadline) external;
```

### 3. Floating Pragma

```solidity
// Bad
pragma solidity ^0.8.0;

// Good
pragma solidity 0.8.20;
```

### 4. Unbounded Loops

```solidity
// Bad: Can run out of gas
for (uint256 i = 0; i < users.length; i++) { }

// Good: Paginated
function processBatch(uint256 start, uint256 count) external { }
```

---

## Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Foundry Book](https://book.getfoundry.sh/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [OWASP Smart Contract Security](https://scs.owasp.org/)
- [Ethereum Security Best Practices](https://ethereum.org/en/developers/docs/smart-contracts/security/)
