/**
 * Stellar Helper — Freighter wallet + Horizon testnet logic
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import {
  isConnected,
  setAllowed,
  getAddress,
  signTransaction,
} from '@stellar/freighter-api';

export class StellarHelper {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;
  private publicKey: string | null = null;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.server = new StellarSdk.Horizon.Server(
      network === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );
    this.networkPassphrase =
      network === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC;
  }

  isFreighterInstalled(): boolean {
    return typeof window !== 'undefined';
  }

  async connectWallet(): Promise<string> {
    const connected = await isConnected();
    if (connected.error || connected.isConnected === undefined) {
      throw new Error(
        'Freighter wallet not found. Install the Freighter browser extension and refresh the page.'
      );
    }

    const access = await setAllowed();
    if (access.error) throw new Error(access.error);
    if (!access.isAllowed) {
      throw new Error('Permission to connect was denied in Freighter.');
    }

    const addressResult = await getAddress();
    if (addressResult.error) throw new Error(addressResult.error);

    this.publicKey = addressResult.address;
    return addressResult.address;
  }

  async getBalance(publicKey: string): Promise<{
    xlm: string;
    assets: Array<{ code: string; issuer: string; balance: string }>;
  }> {
    try {
      const account = await this.server.loadAccount(publicKey);

      const xlmBalance = account.balances.find((b) => b.asset_type === 'native');

      const assets = account.balances
        .filter((b) => b.asset_type !== 'native')
        .map((b: StellarSdk.Horizon.HorizonApi.BalanceLineAsset) => ({
          code: b.asset_code!,
          issuer: b.asset_issuer!,
          balance: b.balance,
        }));

      return {
        xlm: xlmBalance && 'balance' in xlmBalance ? xlmBalance.balance : '0',
        assets,
      };
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return { xlm: '0', assets: [] };
      }
      throw error;
    }
  }

  async sendPayment(params: {
    from: string;
    to: string;
    amount: string;
    memo?: string;
  }): Promise<{ hash: string; success: boolean }> {
    const amountNum = parseFloat(params.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid payment amount.');
    }

    const account = await this.server.loadAccount(params.from);

    const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    });

    let accountExists = true;
    try {
      await this.server.loadAccount(params.to);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) accountExists = false;
      else throw error;
    }

    if (accountExists) {
      transactionBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: params.to,
          asset: StellarSdk.Asset.native(),
          amount: params.amount,
        })
      );
    } else {
      if (amountNum < 1) {
        throw new Error(
          'New unfunded accounts require at least 1 XLM to activate on the ledger.'
        );
      }
      transactionBuilder.addOperation(
        StellarSdk.Operation.createAccount({
          destination: params.to,
          startingBalance: params.amount,
        })
      );
    }

    if (params.memo) {
      transactionBuilder.addMemo(StellarSdk.Memo.text(params.memo));
    }

    const transaction = transactionBuilder.setTimeout(180).build();

    const signResult = await signTransaction(transaction.toXDR(), {
      networkPassphrase: this.networkPassphrase,
    });

    if (signResult.error) throw new Error(signResult.error);

    const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
      signResult.signedTxXdr,
      this.networkPassphrase
    );

    const result = await this.server.submitTransaction(
      transactionToSubmit as StellarSdk.Transaction
    );

    return {
      hash: result.hash,
      success: result.successful,
    };
  }

  async getRecentTransactions(
    publicKey: string,
    limit: number = 15
  ): Promise<
    Array<{
      id: string;
      type: string;
      amount?: string;
      asset?: string;
      from?: string;
      to?: string;
      createdAt: string;
      hash: string;
    }>
  > {
    const payments = await this.server
      .payments()
      .forAccount(publicKey)
      .order('desc')
      .limit(limit)
      .call();

    return payments.records.map((payment: StellarSdk.Horizon.ServerApi.PaymentOperationRecord) => ({
      id: payment.id,
      type: payment.type,
      amount: payment.amount || (payment as { starting_balance?: string }).starting_balance,
      asset: payment.asset_type === 'native' ? 'XLM' : payment.asset_code,
      from: payment.from,
      to: payment.to,
      createdAt: payment.created_at,
      hash: payment.transaction_hash,
    }));
  }

  getExplorerLink(hash: string, type: 'tx' | 'account' = 'tx'): string {
    const network =
      this.networkPassphrase === StellarSdk.Networks.TESTNET ? 'testnet' : 'public';
    return `https://stellar.expert/explorer/${network}/${type}/${hash}`;
  }

  formatAddress(address: string, startChars: number = 4, endChars: number = 4): string {
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  disconnect() {
    this.publicKey = null;
    return true;
  }
}

export const stellar = new StellarHelper('testnet');
