import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  DynamicBondingCurveClient,
  CollectFeeMode,
  TokenType,
  ActivationType,
  MigrationOption,
  FeeSchedulerMode,
  MigrationFeeOption,
  TokenDecimal,
  buildCurveWithMarketCap,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { NATIVE_MINT } from "@solana/spl-token";
import BN from "bn.js";
import bs58 from "bs58";

async function createConfig() {
  const PAYER_PRIVATE_KEY = "";
  const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
  const payer = Keypair.fromSecretKey(payerSecretKey);
  console.log("Payer public key:", payer.publicKey.toBase58());

  const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed"
  );

  const config = Keypair.generate();
  console.log(`Config account: ${config.publicKey.toString()}`);

  const feeClaimer = new PublicKey("");

  const curveConfig = buildCurveWithMarketCap({
    totalTokenSupply: 1000000000,
    initialMarketCap: 20,
    migrationMarketCap: 320,
    migrationOption: MigrationOption.MET_DAMM_V2,
    tokenBaseDecimal: TokenDecimal.SIX,
    tokenQuoteDecimal: TokenDecimal.NINE,
    lockedVesting: {
        amountPerPeriod: new BN(0),
        cliffDurationFromMigrationTime: new BN(0),
        frequency: new BN(0),
        numberOfPeriod: new BN(0),
        cliffUnlockAmount: new BN(0),
    },
    feeSchedulerParam: {
        startingFeeBps: 25,
        endingFeeBps: 25,
        numberOfPeriod: 0,
        totalDuration: 0,
        feeSchedulerMode: FeeSchedulerMode.Linear,
    },
    dynamicFeeEnabled: true,
    activationType: ActivationType.Slot,
    collectFeeMode: CollectFeeMode.OnlyQuote,
    migrationFeeOption: MigrationFeeOption.FixedBps100,
    tokenType: TokenType.SPL,
    partnerLpPercentage: 0,
    creatorLpPercentage: 0,
    partnerLockedLpPercentage: 100,
    creatorLockedLpPercentage: 0,
    creatorTradingFeePercentage: 0,
    leftover: 10000,
})

console.log("curve config", curveConfig);

  try {
    const client = new DynamicBondingCurveClient(connection, "confirmed");

    const transaction = await client.partner.createConfig({
      config: config.publicKey,
      feeClaimer,
      leftoverReceiver: feeClaimer,
      quoteMint: NATIVE_MINT,
      payer: payer.publicKey,
      ...curveConfig
    });

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payer.publicKey;

    transaction.partialSign(config);

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer, config],
      { commitment: "confirmed" }
    );

    console.log(`Config created successfully!`);
    console.log(`Transaction: https://solscan.io/tx/${signature}`);
    console.log(`Config address: ${config.publicKey.toString()}`);
  } catch (error) {
    console.error("Failed to create config:", error);
  }
}

createConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
