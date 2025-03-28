import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';
import { Keypair, PublicKey } from '@solana/web3.js';
import { connection } from './connection.js';

export async function createNewToken(provider) {
  try {
    if (!provider) throw new Error('Provider is undefined');
    if (!provider.isConnected) throw new Error('Wallet not connected');
    if (!provider.publicKey) throw new Error('Public key is undefined');
    if (typeof provider.signTransaction !== 'function') throw new Error('Provider cannot sign transactions');

    console.log('Provider state:', {
      isConnected: provider.isConnected,
      publicKey: provider.publicKey.toString(),
      canSign: typeof provider.signTransaction === 'function',
    });

    const mintKeypair = Keypair.generate();
    const payer = provider.publicKey;

    console.log('Mint keypair:', mintKeypair.publicKey.toBase58());
    console.log('Payer:', payer.toBase58());

    const mint = await createMint(
      connection,
      provider, // Signs the transaction
      payer,    // Mint authority
      null,     // Freeze authority
      9         // Decimals
    );

    console.log('Mint created:', mint.toBase58());

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      provider,
      mint,
      payer
    );

    console.log('Token account:', tokenAccount.address.toBase58());

    return { mint, tokenAccount };
  } catch (error) {
    console.error('Token creation error:', error);
    throw error;
  }
}

export async function mintTokens(provider, mint, tokenAccount, amount) {
  try {
    if (!provider.isConnected) throw new Error('Wallet not connected');
    if (!provider.publicKey) throw new Error('Public key is undefined');
    const transactionSignature = await mintTo(
      connection,
      provider,
      mint,
      tokenAccount.address,
      provider.publicKey,
      amount * 1e9
    );
    return transactionSignature;
  } catch (error) {
    throw new Error(`Minting failed: ${error.message}`);
  }
}

export async function sendTokens(provider, mint, sourceTokenAccount, destinationAddress, amount) {
  try {
    if (!provider.isConnected) throw new Error('Wallet not connected');
    if (!provider.publicKey) throw new Error('Public key is undefined');
    const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      provider,
      mint,
      new PublicKey(destinationAddress)
    );
    const transactionSignature = await transfer(
      connection,
      provider,
      sourceTokenAccount.address,
      destinationTokenAccount.address,
      provider.publicKey,
      amount * 1e9
    );
    return transactionSignature;
  } catch (error) {
    throw new Error(`Transfer failed: ${error.message}`);
  }
}

export async function getTokenBalance(tokenAccount) {
  try {
    const balance = await connection.getTokenAccountBalance(tokenAccount.address);
    return balance.value.uiAmount;
  } catch (error) {
    throw new Error(`Failed to fetch token balance: ${error.message}`);
  }
}