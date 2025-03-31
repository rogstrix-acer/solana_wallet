/**
 * @module wallet
 * @description Provides functionality for connecting to and managing a Solana wallet.
 * This module handles wallet connection, disconnection, and transaction history retrieval.
 */

import { connection } from './connection.js';
import { PublicKey } from '@solana/web3.js';

/**
 * Connects to a Phantom wallet and retrieves the wallet's public key and SOL balance.
 * @async
 * @param {Object} provider - The Phantom wallet provider
 * @param {boolean} provider.isPhantom - Whether the provider is Phantom
 * @param {Function} provider.connect - Function to connect to the wallet
 * @param {PublicKey} provider.publicKey - The public key of the wallet after connection
 * @returns {Promise<{publicKey: string, balance: number}>} The wallet's public key and SOL balance
 * @throws {Error} If Phantom wallet is not found or connection fails
 */
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

/**
 * Disconnects from the currently connected Phantom wallet.
 * @async
 * @param {Object} provider - The Phantom wallet provider
 * @param {boolean} provider.isConnected - Whether the wallet is currently connected
 * @param {Function} provider.disconnect - Function to disconnect from the wallet
 * @returns {Promise<string>} A message indicating the disconnection status
 * @throws {Error} If disconnection fails
 */
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

/**
 * Retrieves recent transaction history for a wallet address.
 * @async
 * @param {string|PublicKey} publicKey - The public key of the wallet
 * @returns {Promise<Array<Object>>} Array of recent transactions with signatures and timestamps
 * @throws {Error} If transaction history fetch fails
 */
export async function getTransactionHistory(publicKey) {
  try {
    const signatures = await connection.getSignaturesForAddress(new PublicKey(publicKey), { limit: 5 });
    return signatures;
  } catch (error) {
    throw new Error(`Failed to fetch transaction history: ${error.message}`);
  }
}