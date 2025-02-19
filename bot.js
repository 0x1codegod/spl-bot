require("dotenv").config();

const bs58 = require("bs58");

const {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} = require("@solana/web3.js");

const {
  getOrCreateAssociatedTokenAccount,
  approve,
  transfer,
  getAccount, 
  TOKEN_PROGRAM_ID 
} = require("@solana/spl-token");

(async () => {
  console.log("0. Initializing...");

  // Define constants
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  // Load private keys from environment

const privateKey1 = bs58.decode(process.env.COMPROMISED_PRIVATE_KEY);
const privateKey2 = bs58.decode(process.env.BENEFICIARY_PRIVATE_KEY);

  // Token Contract Address
  const tokenCA = new PublicKey("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN");

  // Keypairs for Address1 and Address2
  const address1 = Keypair.fromSecretKey(privateKey1);
  const address2 = Keypair.fromSecretKey(privateKey2);

  console.log(address1.publicKey.toBase58(), "address 1");
  console.log(address2.publicKey.toBase58(), "address 2");

  try {
    console.log("1. Fetching or creating associated token accounts...");
    const address1TokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      address1,
      tokenCA,
      address1.publicKey
    );

    const address2TokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      address2,
      tokenCA,
      address2.publicKey
    );

    console.log("Address1 token account:", address1TokenAccount.address.toBase58());
    console.log("Address2 token account:", address2TokenAccount.address.toBase58());
    
    console.log("2. Fetching token balance for Address1...");
    const tokenBalance = await connection.getTokenAccountBalance(
      address1TokenAccount.address
    );

    console.log("Token balance:", tokenBalance.value.amount);
    

    console.log(`3. Approving ${amountToApprove} tokens for Address2...`);
    await approve(
      connection,
      address1,
      address1TokenAccount.address,
      address2.publicKey,
      address1,
      amountToApprove,
      []
    );

    console.log(`Approved ${amountToApprove} tokens.`);

  // Fetch the account information
      const tokenAccount = await getAccount(connection, address1TokenAccount.address, TOKEN_PROGRAM_ID);

      // Check if there's a delegate
      if (tokenAccount.delegate === null) {
        console.log('No allowance set for this account.');
      } else {
        // Fetch and display the delegate and allowance
        console.log(`Delegate Address: ${tokenAccount.delegate.toBase58()}`);
        console.log(`Allowance (delegated amount): ${tokenAccount.delegatedAmount.toString()}`);
      }

    console.log(`4. Transferring ${amountToApprove} tokens to Address2...`);
    
    await transfer(
      connection,
      address2,
      address1TokenAccount.address,
      address2TokenAccount.address,
      address1,
      amountToApprove,
      []
    );

    console.log(`Transferred ${amountToApprove} tokens from Address1 to Address2.`);
  } catch (error) {
    console.error("Error occurred during transaction:", error);
  }
})();
