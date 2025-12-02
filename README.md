# SurveySensei

A web application that enables users to create blockchain-based surveys by connecting their crypto wallet, generating survey parameters through AI, and locking funds on-chain for survey rewards.

## Features

- **Wallet Connection**: Connect multiple crypto wallets (MetaMask, Coinbase, Rainbow, Rabby, Zerion, in-app wallets)
- **AI Survey Generation**: Generate survey parameters using AI based on user description
- **Blockchain Integration**: Create surveys on-chain with BNB payments for rewards
- **Real-time Status**: Track progress with real-time status updates
- **Responsive Design**: Mobile-friendly interface

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Web3 Integration**: Thirdweb SDK v5
- **Blockchain**: BNB Chain (Binance Smart Chain)
- **AI Integration**: Custom AI Agent API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```
   VITE_TEMPLATE_CLIENT_ID=your_thirdweb_client_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button and choose your preferred wallet provider
2. **Describe Survey**: Enter your survey requirements in the textarea (e.g., "Make a survey about hoodies for crypto enthusiasts with 100 responses and 1 BNB total reward")
3. **Create Survey**: Click "Create Survey" to generate AI parameters and execute the blockchain transaction
4. **Monitor Progress**: Watch real-time status updates as the survey is created

## Project Structure

```
src/
├── components/          # Reusable UI components
├── config/             # Configuration files (Thirdweb)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## API Integration

The application integrates with an AI Agent API to generate survey parameters:

- **Endpoint**: `POST https://surveysensei-agent.rahmandana08.workers.dev/agent/create`
- **Request Body**: `{ content: "survey description + wallet address" }`
- **Response**: Survey parameters including surveyId, totalReward, and targetResponses

## Blockchain Integration

Survey creation involves:
- Converting BNB amounts to Wei
- Preparing blockchain transactions
- Executing on-chain survey creation
- Handling transaction confirmations

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run check` - Run TypeScript type checking
- `npm run preview` - Preview production build

### Code Quality

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for styling
- Thirdweb SDK for Web3 integration

## License

This project is licensed under the MIT License.