/**
 * @component WalletComponent
 * @description A React component that provides a user interface for interacting with Solana blockchain.
 * Supports wallet connection, token creation, minting, sending tokens, and viewing transaction history.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  Power,
  Coins,
  Send,
  ReceiptText,
  RefreshCcw,
  PlusCircle,
  Copy,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  connectWallet,
  disconnectWallet,
  getTransactionHistory
} from '../lib/wallet';
import {
  createNewToken,
  mintTokens,
  sendTokens,
  getTokenBalance
} from '../lib/token';
import { connection } from '../lib/connection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletComponent() {
  const [walletInfo, setWalletInfo] = useState('Not connected');
  const [status, setStatus] = useState('Idle');
  const [mint, setMint] = useState(null);
  const [tokenAccount, setTokenAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [solBalance, setSolBalance] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [dialogError, setDialogError] = useState('');

  useEffect(() => {
    const checkPhantom = () => {
      if (window.solana && window.solana.isPhantom) {
        setProvider(window.solana);
      }
    };
    checkPhantom();
    window.addEventListener('load', checkPhantom);
    return () => window.removeEventListener('load', checkPhantom);
  }, []);

  useEffect(() => {
    if (provider) {
      const handleConnect = async (pubKey) => {
        setPublicKey(pubKey);
        const balance = await connection.getBalance(pubKey);
        setSolBalance(balance / 1e9);
        setWalletInfo(`${pubKey.toString().slice(0, 6)}...${pubKey.toString().slice(-6)}`);
      };
      const handleDisconnect = () => {
        setPublicKey(null);
        setSolBalance(0);
        setWalletInfo('Not connected');
      };
      provider.on('connect', handleConnect);
      provider.on('disconnect', handleDisconnect);
      if (provider.isConnected && provider.publicKey) handleConnect(provider.publicKey);
      return () => {
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
      };
    }
  }, [provider]);

  const executeWithLoading = async (fn, successMessage) => {
    setIsLoading(true);
    setDialogError('');
    try {
      const result = await fn();
      setStatus(successMessage || result);
      return result;
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
      setDialogError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus('Idle'), 3000); // Clear status after 3 seconds
    }
  };

  // TThis is function to handle wallet connection
  const handleConnectWallet = () => executeWithLoading(
    async () => {
      if (!provider) throw new Error('No Phantom wallet detected');
      const { publicKey, balance } = await connectWallet(provider);
      setPublicKey(publicKey);
      setSolBalance(balance);
      setWalletInfo(`${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-6)}`);
      return 'Wallet connected successfully';
    }
  );

  // This is function to handle wallet disconnection
  const handleDisconnectWallet = () => executeWithLoading(
    async () => {
      if (!provider) throw new Error('No wallet to disconnect');
      const message = await disconnectWallet(provider);
      setPublicKey(null);
      setSolBalance(0);
      setMint(null);
      setTokenAccount(null);
      setWalletInfo('Not connected');
      return 'Wallet disconnected successfully';
    }
  );

  // This is function to handle token creation
  const handleCreateToken = () => executeWithLoading(
    async () => {
      if (!provider || !publicKey) throw new Error('Please connect your wallet first');
      if (solBalance < 0.002) throw new Error('Insufficient SOL. You need at least 0.002 SOL.');
      const { mint, tokenAccount } = await createNewToken(provider);
      setMint(mint);
      setTokenAccount(tokenAccount);
      return `Token created: ${mint.toBase58().slice(0, 12)}...`;
    }
  );

  // This is function to handle minting tokens
  const handleMintTokens = () => executeWithLoading(
    async () => {
      if (!provider || !publicKey) throw new Error('Please connect your wallet first');
      if (!mint || !tokenAccount) throw new Error('Create a token first');
      const txSignature = await mintTokens(provider, mint, tokenAccount, 100);
      return `Minted 100 tokens. Tx: ${txSignature.slice(0, 12)}...`;
    }
  );


  // This is function to handle sending tokens
  const handleSendTokens = () => executeWithLoading(
    async () => {
      if (!provider || !publicKey) throw new Error('Please connect your wallet first');
      if (!mint || !tokenAccount) throw new Error('Create and mint tokens first');
      const txSignature = await sendTokens(provider, mint, tokenAccount, recipientAddress, 50);
      setRecipientAddress('');
      return `Sent 50 tokens. Tx: ${txSignature.slice(0, 12)}...`;
    }
  );

  // This is function to handle checking token balance
  const handleCheckBalance = () => executeWithLoading(
    async () => {
      if (!provider || !publicKey) throw new Error('Please connect your wallet first');
      if (!tokenAccount) throw new Error('Create a token first');
      const balance = await getTokenBalance(tokenAccount);
      return `Token Balance: ${balance}`;
    }
  );

  // This is function to handle fetching transaction history
  const handleTransactionHistory = () => executeWithLoading(
    async () => {
      if (!provider || !publicKey) throw new Error('Please connect your wallet first');
      const history = await getTransactionHistory(provider.publicKey);
      setTransactionHistory(history);
      return 'Transaction history updated';
    }
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicKey.toString());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!provider) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6"
      >
        <Card className="w-full max-w-md shadow-2xl rounded-xl border-2 border-indigo-100 overflow-hidden">
          <CardHeader className="bg-white border-b border-indigo-100 p-4">
            <CardTitle className="text-2xl font-bold text-center text-indigo-800">Wallet Connection</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 p-6 bg-white">
            <p className="text-gray-600">Phantom wallet is required to proceed.</p>
            <Button
              variant="outline"
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              onClick={() => window.open('https://phantom.app/', '_blank')}
            >
              <Wallet className="mr-2" /> Get Phantom Wallet
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 flex flex-col items-center rounded-3xl"
    >
      <Card className="w-full max-w-md shadow-2xl rounded-xl border-2 border-indigo-100 overflow-hidden p-4">
        <CardHeader className="bg-white border-b border-indigo-100 flex flex-row items-center justify-between p-4 shadow-sm">
          <CardTitle className="text-xl font-bold text-indigo-800">Solana Wallet</CardTitle>
          <Badge
            variant={publicKey ? 'default' : 'destructive'}
            className="px-3 py-1 text-xs font-semibold"
          >
            {publicKey ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="space-y-6">
            <motion.div
              className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg shadow-md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm text-gray-500">Wallet Address</p>
                  <p className="font-mono text-indigo-700">{walletInfo}</p>
                </div>
                {publicKey && (
                  <button
                    onClick={copyToClipboard}
                    className="text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    {isCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">SOL Balance</p>
                <p className="text-lg font-semibold text-indigo-800">{solBalance.toFixed(4)} SOL</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {!publicKey ? (
                <Button
                  onClick={handleConnectWallet}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wallet className="mr-2" />}
                  {isLoading ? 'Connecting...' : 'Connect'}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleDisconnectWallet}
                  className="w-full bg-red-600 hover:bg-red-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Power className="mr-2" />}
                  {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    disabled={isLoading || !publicKey}
                  >
                    <Send className="mr-2" /> Send
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-2xl border-2 border-indigo-100">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-2xl font-bold text-indigo-800">Send Tokens</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Send tokens to another Solana wallet address
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 p-4">
                    {dialogError && (
                      <p className="text-red-500 text-sm">{dialogError}</p>
                    )}
                    <div>
                      <Label className="text-sm text-indigo-700">Recipient Address</Label>
                      <Input
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter recipient address"
                        className="mt-1 border-indigo-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                      />
                    </div>
                    <Button
                      onClick={async () => {
                        const result = await handleSendTokens();
                        if (result) {
                          setRecipientAddress('');
                          setDialogError('');
                        }
                      }}
                      disabled={!publicKey || !recipientAddress || isLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white"
                    >
                      {isLoading ? 'Sending...' : 'Send 50 Tokens'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCreateToken}
                disabled={!publicKey || isLoading}
                variant="secondary"
                className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
                {isLoading ? 'Creating Token...' : 'Create Token'}
              </Button>
              <Button
                onClick={handleMintTokens}
                disabled={!publicKey || !mint || isLoading}
                variant="secondary"
                className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Coins className="mr-2" />}
                {isLoading ? 'Minting Tokens...' : 'Mint Tokens'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCheckBalance}
                disabled={!publicKey || isLoading}
                variant="outline"
                className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <RefreshCcw className="mr-2" />}
                {isLoading ? 'Checking Balance...' : 'Check Balance'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!publicKey || isLoading}
                    onClick={handleTransactionHistory}
                    className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <ReceiptText className="mr-2" />}
                    {isLoading ? 'Loading Transactions...' : 'Transactions'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg bg-white rounded-xl shadow-2xl border-2 border-indigo-100">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-2xl font-bold text-indigo-800">Transaction History</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Recent transactions for your wallet
                    </DialogDescription>
                  </DialogHeader>
                  <AnimatePresence>
                    {transactionHistory.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3 p-4"
                      >
                        {transactionHistory.map((tx, index) => (
                          <motion.div
                            key={index}
                            className="bg-indigo-50 p-3 rounded-md text-sm shadow-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <p className="font-mono text-indigo-700">{tx.signature.slice(0, 12)}...</p>
                            <p className="text-gray-500">{tx.date}</p>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-gray-500 p-4"
                      >
                        No transactions found
                      </motion.p>
                    )}
                  </AnimatePresence>
                </DialogContent>
              </Dialog>
            </div>

            <AnimatePresence>
              {status !== 'Idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-sm text-indigo-700 bg-indigo-50 p-3 rounded-md shadow-md"
                >
                  {status}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
