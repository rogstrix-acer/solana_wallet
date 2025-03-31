/**
 * @module connection
 * @description Establishes and exports a connection to the Solana blockchain network.
 * This module provides a configured Connection instance for interacting with the Solana devnet.
 */

import { Connection, clusterApiUrl } from '@solana/web3.js';

/**
 * A Connection instance configured for the Solana devnet cluster.
 * Uses 'confirmed' commitment level for transaction confirmation.
 * @constant {Connection}
 */
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');