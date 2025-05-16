import {
    buildCurveGraph,
    ActivationType,
    CollectFeeMode,
    FeeSchedulerMode,
    MigrationFeeOption,
    MigrationOption,
    TokenDecimal,
    TokenType,
} from '@meteora-ag/dynamic-bonding-curve-sdk'
import BN from 'bn.js'
import Decimal from 'decimal.js'

async function testBuildCurveGraph() {
    console.log('Testing config curve...')

    // semi-bullish curve
    let liquidityWeights: number[] = []

    for (let i = 0; i < 16; i++) {
        if (i < 5) {
            liquidityWeights[i] = new Decimal(1.1)
                .pow(new Decimal(i))
                .toNumber()
        } else {
            liquidityWeights[i] = new Decimal(1.4)
                .pow(new Decimal(i))
                .toNumber()
        }
    }

    // OG bullish curve
    // const liquidityWeights = [
    //     0.01, // 0
    //     0.02, // 1
    //     0.04, // 2
    //     0.08, // 3
    //     0.16, // 4
    //     0.32, // 5
    //     0.64, // 6
    //     1.28, // 7
    //     2.56, // 8
    //     5.12, // 9
    //     10.24, // 10
    //     20.48, // 11
    //     40.96, // 12
    //     81.92, // 13
    //     163.84, // 14
    //     327.68, // 15
    // ]

    const config = buildCurveGraph({
        totalTokenSupply: 1000000000,
        initialMarketCap: 500,
        migrationMarketCap: 1000000,
        migrationOption: MigrationOption.MET_DAMM_V2,
        tokenBaseDecimal: TokenDecimal.SIX,
        tokenQuoteDecimal: TokenDecimal.SIX,
        lockedVesting: {
            amountPerPeriod: new BN(0),
            cliffDurationFromMigrationTime: new BN(0),
            frequency: new BN(0),
            numberOfPeriod: new BN(0),
            cliffUnlockAmount: new BN(0),
        },
        feeSchedulerParam: {
            numberOfPeriod: 0,
            reductionFactor: 0,
            periodFrequency: 0,
            feeSchedulerMode: FeeSchedulerMode.Linear,
        },
        baseFeeBps: 100,
        dynamicFeeEnabled: true,
        activationType: ActivationType.Slot,
        collectFeeMode: CollectFeeMode.OnlyQuote,
        migrationFeeOption: MigrationFeeOption.FixedBps100,
        tokenType: TokenType.SPL,
        partnerLpPercentage: 100,
        creatorLpPercentage: 0,
        partnerLockedLpPercentage: 0,
        creatorLockedLpPercentage: 0,
        creatorTradingFeePercentage: 0,
        leftover: 500000000,
        liquidityWeights,
    })

    console.log('BuildCurveGraph Config:', config)
}

async function main() {
    try {
        await testBuildCurveGraph()
        console.log('\n')
    } catch (error) {
        console.error('Error in main:', error)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
