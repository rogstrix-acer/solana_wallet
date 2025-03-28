import { connection } from './connection.js';
import { PublicKey } from '@solana/web3.js';

export async function connectWallet(provider) {
  try {
    if (!provider || !provider.isPhantom) {
      throw new Error('Phantom wallet not found. Please install it.');
    }

    await provider.connect();
    const publicKey = provider.publicKey.toString();

    const balance = await connection.getBalance(provider.publicKey);
    return { publicKey, balance: balance / 1e9 }; // Convert lamports to SOL
  } catch (error) {
    throw new Error(`Wallet connection failed: ${error.message}`);
  }
}

export async function disconnectWallet(provider) {
  try {
    if (provider.isConnected) {
      await provider.disconnect();
      return 'Wallet disconnected';
    }
    return 'No wallet connected';
  } catch (error) {
    throw new Error(`Disconnect failed: ${error.message}`);
  }
}

export async function getTransactionHistory(publicKey) {
  try {
    const signatures = await connection.getSignaturesForAddress(new PublicKey(publicKey), { limit: 5 });
    return signatures;
  } catch (error) {
    throw new Error(`Failed to fetch transaction history: ${error.message}`);
  }
}