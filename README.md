# Solana Wallet Web Application

A modern web application for interacting with the Solana blockchain, built with Next.js and the Solana Web3.js library. This wallet interface allows users to connect their Phantom wallet, view balances, and track transaction history on the Solana devnet.

## Features

- Phantom wallet integration
- SOL balance display
- Transaction history viewing
- Real-time connection to Solana devnet
- Modern and responsive UI built with Next.js

## Prerequisites

- Node.js (v18 or higher)
- NPM or Yarn package manager
- [Phantom Wallet](https://phantom.app/) browser extension

## Installation

1. Clone the repository:
```bash
git clone solana_wallet
cd solana_wallet
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Ensure you have the Phantom wallet browser extension installed
2. Connect your Phantom wallet using the "Connect Wallet" button
3. View your SOL balance and recent transaction history
4. Disconnect your wallet when finished

## Development

This project uses:
- [Next.js](https://nextjs.org/) for the frontend framework
- [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/) for Solana blockchain interactions
- [Phantom Wallet](https://phantom.app/) as the Solana wallet provider

The application connects to the Solana devnet by default for development and testing purposes.

## Project Structure

```
src/
  ├── app/          # Next.js app directory
  ├── components/   # React components
  └── lib/          # Utility functions and Solana interactions
      ├── connection.js  # Solana network connection setup
      ├── token.js      # Token-related operations
      ├── utils.js      # Helper utilities
      └── wallet.js     # Wallet connection management
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
