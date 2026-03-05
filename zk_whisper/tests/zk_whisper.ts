import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ZkWhisper } from "../target/types/zk_whisper";
import { expect } from "chai";
import {
    Keypair,
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";

describe("zk_whisper", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.ZkWhisper as Program<ZkWhisper>;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /** Derive the CivicReport PDA. */
    function findReportPda(reporter: PublicKey, reportId: number): [PublicKey, number] {
        const reportIdBuf = Buffer.alloc(8);
        reportIdBuf.writeBigUInt64LE(BigInt(reportId));
        return PublicKey.findProgramAddressSync(
            [Buffer.from("report"), reporter.toBuffer(), reportIdBuf],
            program.programId
        );
    }

    /** Derive the EchoReceipt PDA. */
    function findEchoPda(report: PublicKey, voter: PublicKey): [PublicKey, number] {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("echo"), report.toBuffer(), voter.toBuffer()],
            program.programId
        );
    }

    /** Fund a keypair with SOL from the provider. */
    async function fund(kp: Keypair, sol: number = 2) {
        const sig = await provider.connection.requestAirdrop(
            kp.publicKey,
            sol * LAMPORTS_PER_SOL
        );
        await provider.connection.confirmTransaction(sig, "confirmed");
    }

    /** Create a report and return its PDA address. */
    async function createReport(
        reporter: Keypair,
        reportId: number
    ): Promise<PublicKey> {
        const [reportPda] = findReportPda(reporter.publicKey, reportId);

        await program.methods
            .initializeReport(
                new anchor.BN(reportId),
                27.7,               // lat (Butwal area)
                83.45,              // lng
                "Rupandehi",        // district
                10,                 // ward
                "QmFakeIpfsCid123"  // ipfs_cid
            )
            .accounts({
                civicReport: reportPda,
                reporter: reporter.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([reporter])
            .rpc();

        return reportPda;
    }

    /** Echo a report from a given voter wallet. */
    async function echoReport(reportPda: PublicKey, voter: Keypair) {
        const [echoPda] = findEchoPda(reportPda, voter.publicKey);

        await program.methods
            .echoReport()
            .accounts({
                civicReport: reportPda,
                echoReceipt: echoPda,
                voter: voter.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([voter])
            .rpc();
    }

    // -----------------------------------------------------------------------
    // Tests
    // -----------------------------------------------------------------------

    it("creates a new civic report", async () => {
        const reporter = Keypair.generate();
        await fund(reporter);

        const reportId = 1;
        const reportPda = await createReport(reporter, reportId);

        const account = await program.account.civicReport.fetch(reportPda);

        expect(account.reporter.toBase58()).to.equal(reporter.publicKey.toBase58());
        expect(account.reportId.toNumber()).to.equal(reportId);
        expect(account.district).to.equal("Rupandehi");
        expect(account.wardNumber).to.equal(10);
        expect(account.ipfsCid).to.equal("QmFakeIpfsCid123");
        expect(account.upvotes.toNumber()).to.equal(0);
        expect(account.isPetition).to.equal(false);
    });

    it("echoes a report and increments upvotes", async () => {
        const reporter = Keypair.generate();
        const voter = Keypair.generate();
        await fund(reporter);
        await fund(voter);

        const reportPda = await createReport(reporter, 2);
        await echoReport(reportPda, voter);

        const account = await program.account.civicReport.fetch(reportPda);
        expect(account.upvotes.toNumber()).to.equal(1);
        expect(account.isPetition).to.equal(false);
    });

    it("prevents duplicate echo from the same wallet", async () => {
        const reporter = Keypair.generate();
        const voter = Keypair.generate();
        await fund(reporter);
        await fund(voter);

        const reportPda = await createReport(reporter, 3);
        await echoReport(reportPda, voter);

        // Second echo from the same voter should fail
        try {
            await echoReport(reportPda, voter);
            expect.fail("Expected duplicate echo to throw");
        } catch (err: any) {
            // Anchor will throw because the EchoReceipt PDA `init` constraint fails
            // when the account already exists.
            expect(err).to.exist;
        }
    });

    it("converts to petition at 100 echoes", async () => {
        const reporter = Keypair.generate();
        await fund(reporter, 5);

        const reportPda = await createReport(reporter, 4);

        // Generate and fund 100 unique voter wallets, then echo from each
        const voters: Keypair[] = [];
        for (let i = 0; i < 100; i++) {
            voters.push(Keypair.generate());
        }

        // Fund all voters in batches to avoid rate limits
        const BATCH_SIZE = 10;
        for (let i = 0; i < voters.length; i += BATCH_SIZE) {
            const batch = voters.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map((v) => fund(v, 1)));
        }

        // Echo from each voter sequentially
        for (let i = 0; i < voters.length; i++) {
            await echoReport(reportPda, voters[i]);
        }

        const account = await program.account.civicReport.fetch(reportPda);
        expect(account.upvotes.toNumber()).to.equal(100);
        expect(account.isPetition).to.equal(true);
    });
});
