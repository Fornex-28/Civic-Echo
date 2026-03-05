---
description: How to deploy the ZK-Whisper smart contract to Solana devnet
---

# Deploy to Devnet

## Prerequisites

1. **Rust**: Install from https://rustup.rs/
2. **Solana CLI**: Install from https://docs.solanalabs.com/cli/install
3. **Anchor CLI**: Install with `cargo install --git https://github.com/coral-xyz/anchor avm --force && avm install 0.30.1 && avm use 0.30.1`

## Steps

// turbo-all

1. Set Solana to devnet:
```bash
solana config set --url devnet
```

2. Create a new keypair (if you don't have one):
```bash
solana-keygen new --outfile ~/.config/solana/id.json
```

3. Airdrop SOL for deployment:
```bash
solana airdrop 2
```

4. Build the Anchor program:
```bash
cd zk_whisper
anchor build
```

5. Get your program's keypair public key:
```bash
solana address -k target/deploy/zk_whisper-keypair.json
```

6. **Important**: Copy the program ID from step 5 and update it in these files:
   - `programs/zk_whisper/src/lib.rs` → `declare_id!("YOUR_PROGRAM_ID")`
   - `Anchor.toml` → `[programs.devnet]` section
   - `frontend/src/lib/idl/zk_whisper.json` → `metadata.address`
   - `frontend/src/hooks/useZkWhisper.ts` → `PROGRAM_ID`

7. Update `Anchor.toml` to use devnet:
```toml
[programs.devnet]
zk_whisper = "YOUR_PROGRAM_ID"

[provider]
cluster = "devnet"
```

8. Rebuild after updating the program ID:
```bash
anchor build
```

9. Deploy to devnet:
```bash
anchor deploy --provider.cluster devnet
```

10. Verify the deployment:
```bash
solana program show YOUR_PROGRAM_ID
```

11. Update the frontend IDL (copy the generated IDL):
```bash
cp target/idl/zk_whisper.json ../frontend/src/lib/idl/zk_whisper.json
```

## Verification

After deploying, test in the browser:
1. Connect Phantom wallet (set to devnet)
2. Create a report on the map
3. Check Solana Explorer for the transaction
