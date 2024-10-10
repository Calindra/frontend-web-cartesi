# Cartesi frontend web

```
Cartesi Rollups Node version: 2.0.x
```

## Features

With this project you can test some interactions with the Cartesi Rollups project:

1. Metamask integration
2. Send Inspect state Requests and Listing Reports response
3. Sending L2 EIP-712 inputs
4. Sending inputs
5. Depositing Ether
6. Depositing ERC20
7. Depositing ERC721
8. Depositing ERC1155 Single
9. Depositing ERC1155 Batch
10. Listing Notices
11. Listing Reports
12. Listing Vouchers
13. TODO: Executing Vouchers

## Configurtion

Edit src/config.json to set the testnet parameters and deployment, inspect, graphql, rpc addresses.

## Available Scripts

In the project directory, run:

```shell
yarn
yarn codegen
```

to build the app.

```shell
yarn dev --port 3000
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Voucher Notes

To execute Vouchers, the voucher epoch must be finalized so the rollups framework generate the proofs.
As a reminder, you can advance time in hardhat with the command:

```shell
curl -H "Content-Type: application/json" http://localhost:8545 -d '{"id":1337,"jsonrpc":"2.0","method":"anvil_mine","params":[7200]}' 
```

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/lynoferraz/frontend-web-cartesi)

