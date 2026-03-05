/**
 * TypeScript type definitions matching the IDL.
 * In a real workflow, `anchor build` generates these automatically.
 */

export type ZkWhisper = {
    version: "0.1.0";
    name: "zk_whisper";
    instructions: [
        {
            name: "initializeReport";
            accounts: [
                { name: "civicReport"; isMut: true; isSigner: false },
                { name: "reporter"; isMut: true; isSigner: true },
                { name: "systemProgram"; isMut: false; isSigner: false },
            ];
            args: [
                { name: "reportId"; type: "u64" },
                { name: "locationLat"; type: "f32" },
                { name: "locationLng"; type: "f32" },
                { name: "district"; type: "string" },
                { name: "wardNumber"; type: "u8" },
                { name: "ipfsCid"; type: "string" },
            ];
        },
        {
            name: "echoReport";
            accounts: [
                { name: "civicReport"; isMut: true; isSigner: false },
                { name: "echoReceipt"; isMut: true; isSigner: false },
                { name: "voter"; isMut: true; isSigner: true },
                { name: "systemProgram"; isMut: false; isSigner: false },
            ];
            args: [];
        },
    ];
    accounts: [
        {
            name: "CivicReport";
            type: {
                kind: "struct";
                fields: [
                    { name: "reporter"; type: "publicKey" },
                    { name: "reportId"; type: "u64" },
                    { name: "locationLat"; type: "f32" },
                    { name: "locationLng"; type: "f32" },
                    { name: "district"; type: "string" },
                    { name: "wardNumber"; type: "u8" },
                    { name: "ipfsCid"; type: "string" },
                    { name: "upvotes"; type: "u64" },
                    { name: "isPetition"; type: "bool" },
                ];
            };
        },
        {
            name: "EchoReceipt";
            type: {
                kind: "struct";
                fields: [];
            };
        },
    ];
    errors: [
        {
            code: 6000;
            name: "StringTooLong";
            msg: "String field exceeds the 64-byte maximum length.";
        },
    ];
};
