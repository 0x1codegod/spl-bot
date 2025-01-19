require("dotenv").config();

const {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} = require("@solana/web3.js");

const {
  getOrCreateAssociatedTokenAccount,
  getTokenAccountBalance,
  approve,
  transfer,
} = require("@solana/spl-token");

(async () => {

  console.log("0. Initializing...");

  // Define constants
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Private keys (replace with your actual keys)
  const privateKey1 = Uint8Array.from([process.env.CONMPROMISED_PRIVATE_KEY]);
  const privateKey2 = Uint8Array.from([process.env.BENEFICIARY_PRIVATE_KEY]);

  // Token Contract Address
  const tokenCA = new PublicKey("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN");

  // Keypairs for Address1 and Address2
  const address1 = Keypair.fromSecretKey(privateKey1);
  const address2 = Keypair.fromSecretKey(privateKey2);

  try {
    // Get or create associated token accounts for Address1 and Address2
    const address1TokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      address1,
      tokenCA,
      address1.publicKey
    );

    const address2TokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      address2, // Fee payer
      tokenCA,
      address2.publicKey
    );

    console.log("Address1 Token Account:", address1TokenAccount.address.toBase58());
    console.log("Address2 Token Account:", address2TokenAccount.address.toBase58());

    // Fetch token balance for Address1's token account
    const tokenBalance = await connection.getTokenAccountBalance(
      address1TokenAccount.address
    );
    console.log("Token balance:", tokenBalance.value.amount);

    // Step 1: Approve Address2 to spend tokens from Address1
    const amountToApprove = parseInt(tokenBalance.value.amount, 10); // Convert to integer
    await approve(
      connection,
      address1, // Payer
      address1TokenAccount.address,
      address2.publicKey, // Delegate
      address1, // Owner
      amountToApprove,
      [] // Multi-signers (if any)
    );

    console.log(
      `Approved ${amountToApprove} tokens for Address2 to spend from Address1`
    );

    // Step 2: Transfer tokens from Address1 to Address2
    const amountToTransfer = amountToApprove; // Transfer full balance
    await transfer(
      connection,
      address2, // Payer (delegate)
      address1TokenAccount.address, // Source token account
      address2TokenAccount.address, // Destination token account
      address1, // Owner of the source account
      amountToTransfer,
      [] // Multi-signers (if any)
    );

    console.log(
      `Transferred ${amountToTransfer} tokens from Address1 to Address2`
    );
  } catch (error) {
    console.error("Error:", error);
  }
})();
