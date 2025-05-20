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
  buildCurve,
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

  const feeClaimer = new PublicKey("HW2Cg9ZYRGZRzXfdgc1pgGxdYduyVvYrYkg1H2PVLo1H");

  const curveConfig = buildCurve({
    totalTokenSupply: 1000000000,
    percentageSupplyOnMigration: 14,
    migrationQuoteThreshold: 100,
    migrationOption: MigrationOption.MET_DAMM,
    tokenBaseDecimal: TokenDecimal.NINE,
    tokenQuoteDecimal: TokenDecimal.NINE,
    lockedVesting: {
        amountPerPeriod: new BN(1),
        cliffDurationFromMigrationTime: new BN(1),
        frequency: new BN(1),
        numberOfPeriod: new BN(1),
        cliffUnlockAmount: new BN(250_000_000).mul(
            new BN(10).pow(new BN(TokenDecimal.NINE))
        ),
    },
    feeSchedulerParam: {
        numberOfPeriod: 0,
        reductionFactor: 0,
        periodFrequency: 0,
        feeSchedulerMode: FeeSchedulerMode.Linear,
    },
    baseFeeBps: 25,
    dynamicFeeEnabled: true,
    activationType: ActivationType.Slot,
    collectFeeMode: CollectFeeMode.OnlyQuote,
    migrationFeeOption: MigrationFeeOption.FixedBps100,
    tokenType: TokenType.SPL,
    partnerLpPercentage: 0,
    creatorLpPercentage: 0,
    partnerLockedLpPercentage: 0,
    creatorLockedLpPercentage: 100,
    creatorTradingFeePercentage: 100,
    leftover: 0,
})

  try {
    const client = new DynamicBondingCurveClient(connection, "confirmed");

    const transaction = await client.partner.createConfig({
      config: config.publicKey,
      feeClaimer,
      leftoverReceiver: feeClaimer,
      quoteMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
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
