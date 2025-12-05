## 1. Product Overview
A web application that enables users to create blockchain-based surveys by connecting their crypto wallet, generating survey parameters through an agent powered by the Nullshot Agent Framework, and locking funds on-chain for survey rewards.

Target users: Web3 enthusiasts and survey creators who want to incentivize participation with cryptocurrency rewards.

## 2. Core Features

### 2.1 User Roles
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Survey Creator | Wallet connection via Thirdweb | Create surveys, lock funds, view survey status |

### 2.2 Feature Module
The survey creation application consists of the following main pages:
1. **Create Survey page**: Wallet connection, survey description input, agent-based parameter generation (Nullshot), blockchain transaction execution.

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Create Survey | Wallet Connection | Connect/disconnect crypto wallet using Thirdweb ConnectButton with multiple wallet providers (MetaMask, Coinbase, Rainbow, Rabby, Zerion, in-app wallets). |
| Create Survey | Survey Input | Textarea for users to input survey description and requirements (e.g., "Make a survey about hoodies..."). |
| Create Survey | Agent Generation (Nullshot) | Send user input and wallet address to the Nullshot Agent Framework to generate survey parameters including surveyId, totalReward, and targetResponses. |
| Create Survey | Blockchain Transaction | Execute on-chain survey creation with BNB payment equal to totalReward amount, using Thirdweb v5 contract interaction. |
| Create Survey | Status Display | Real-time status updates showing progress: "Generating agent plan...", "Waiting for transaction...", "Survey created successfully!" |

## 3. Core Process
**Survey Creator Flow:**
1. User connects wallet via Thirdweb ConnectButton
2. User inputs survey description in textarea
3. User clicks "Create Survey" button (disabled if wallet not connected)
4. Application calls Nullshot Agent (MCP-enabled) with user input and wallet address
5. Agent returns survey parameters (surveyId, totalReward, targetResponses)
6. Application prepares and executes blockchain transaction with BNB payment
7. Status updates shown throughout the process

```mermaid
graph TD
  A[Connect Wallet] --> B[Input Survey Description]
  B --> C[Click Create Survey]
  C --> D[Call Nullshot Agent]
  D --> E[Receive Survey Parameters]
  E --> F[Execute Blockchain Transaction]
  F --> G[Survey Created Successfully]
```

## 4. User Interface Design

### 4.1 Design Style
- **Primary Colors**: Blue (#3B82F6) for primary actions, Gray (#6B7280) for secondary elements
- **Button Style**: Rounded corners with hover effects, disabled state for disconnected wallet
- **Font**: Inter or system fonts, 16px base size
- **Layout**: Centered card layout with clean spacing
- **Icons**: Thirdweb wallet icons, loading spinners for async operations

### 4.2 Page Design Overview
| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Create Survey | Wallet Connection | Centered ConnectButton with wallet provider logos |
| Create Survey | Survey Input | Large textarea with placeholder text, character limit indicator |
| Create Survey | Action Button | Prominent "Create Survey" button with loading state |
| Create Survey | Status Area | Scrollable log area showing transaction progress and errors |

### 4.3 Responsiveness
Desktop-first design with mobile responsiveness. Touch-friendly buttons and form elements for mobile users.

## 5. Agent & MCP Integration

### 5.1 Nullshot Agent Framework
- Orchestrates survey parameter generation with tool-use and guardrails.
- Receives inputs: `description`, `creatorWallet`.
- Produces: `surveyId`, `totalReward`, `targetResponses`, optional `questions`.

### 5.2 MCP (Model Context Protocol)
- The agent uses MCP to interface with external resources/tools:
  - `surveysensei.store` tool: read/write survey drafts and metadata
  - `web.fetch` tool: access public endpoints when needed
  - `blockchain.helpers` tool: utility for reward/target heuristics (client-side validation remains in the app)
- MCP ensures portable, standardized tool contracts and safer execution.

### 5.3 Error Handling & Retries
- If the agent response fails or is incomplete, the app retries with backoff.
- UI displays status messages and preserves prior content; transaction only proceeds after valid parameters are returned.

### 5.4 Security & Privacy
- Wallet address is used strictly for creator attribution and reward locking.
- No private keys are exposed; MCP tools run with scoped permissions.
