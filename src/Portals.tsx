import React, { useState, useEffect } from "react";
import { getClient, getWalletClient, INodeComponentProps } from "./utils/chain";
import { BaseError, erc20Abi, erc721Abi, parseAbi, parseEther, parseUnits, toHex } from "viem";
// import { erc20PortalAddress, erc20PortalAbi, erc721PortalAddress, erc721PortalAbi, erc1155SinglePortalAddress, erc1155BatchPortalAddress, etherPortalAddress, etherPortalAbi, ierc1155Abi, erc1155SinglePortalAbi, erc1155BatchPortalAbi } from "./generated/rollups"

import * as etherPortal from "@cartesi/rollups/out/IEtherPortal.sol/IEtherPortal.json";
import * as erc20Portal from "@cartesi/rollups/out/IERC20Portal.sol/IERC20Portal.json";
import * as erc721Portal from "@cartesi/rollups/out/IERC721Portal.sol/IERC721Portal.json";
import * as erc1155SinglePortal from "@cartesi/rollups/out/IERC1155SinglePortal.sol/IERC1155SinglePortal.json";
import * as erc1155BatchPortal from "@cartesi/rollups/out/IERC1155BatchPortal.sol/IERC1155BatchPortal.json";

const humanErc1155Abi = [
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address account, address operator) returns (bool)",
];
const erc1155Abi = parseAbi(humanErc1155Abi);

export const Portals: React.FC<INodeComponentProps> = (props: INodeComponentProps) => {
    const [chainId, setChainId] = useState<string>();

    const [erc20Amount, setErc20Amount] = useState<string>("0");
    const [erc20Decimals, setErc20Decimals] = useState<number>(18);
    const [erc20Token, setErc20Token] = useState<string>("");
    const [erc721Id, setErc721Id] = useState<string>("0");
    const [erc721, setErc721] = useState<string>("");
    const [etherAmount, setEtherAmount] = useState<string>("0");
    const [erc1155, setErc1155] = useState<string>("");
    const [erc1155Id, setErc1155Id] = useState<string>("0");
    const [erc1155Amount, setErc1155Amount] = useState<string>("0");
    const [erc1155Ids, setErc1155Ids] = useState<string[]>([]);
    const [erc1155Amounts, setErc1155Amounts] = useState<string[]>([]);
    const [erc1155IdsStr, setErc1155IdsStr] = useState<string>("[]");
    const [erc1155AmountsStr, setErc1155AmountsStr] = useState<string>("[]");

    useEffect(() => {
        if (!props.chain) {
            setChainId(undefined);
            return;
        }
        setChainId(props.chain);
    }, [props.chain]);

    const depositEtherToPortal = async (value: bigint) => {
        try {
            if (chainId) {

                const client = await getClient(chainId);
                const walletClient = await getWalletClient(chainId);

                if (!client || !walletClient) return;

                const [address] = await walletClient.requestAddresses();
                if (!address) return;

                const data = toHex(`Deposited (${value}) ether.`);

                const { request } = await client.simulateContract({
                    account: address,
                    address: "0xc70076a466789B595b50959cdc261227F0D70051",
                    abi: etherPortal.abi,
                    functionName: "depositEther",
                    args: [props.appAddress, data],
                    value: value
                });
                const txHash = await walletClient.writeContract(request);

                await client.waitForTransactionReceipt(
                    { hash: txHash }
                )
            }
        } catch (e) {
            console.log(`${e}`);
        }
    };

    const depositErc20ToPortal = async (token: `0x${string}`, value: bigint) => {
        try {
            if (chainId) {

                const client = await getClient(chainId);
                const walletClient = await getWalletClient(chainId);

                if (!client || !walletClient) return;

                const [address] = await walletClient.requestAddresses();
                if (!address) return;

                const portalAddress= "0xc700D6aDd016eECd59d989C028214Eaa0fCC0051";

                const currAllowance = await client.readContract({
                    address: token,
                    abi: erc20Abi,
                    functionName: "allowance",
                    args: [address,portalAddress]
                });

                if (currAllowance < value) {

                    const { request } = await client.simulateContract({
                        account: address,
                        address: token,
                        abi: erc20Abi,
                        functionName: 'approve',
                        args: [portalAddress,value]
                    });
                    const txHash = await walletClient.writeContract(request);

                    await client.waitForTransactionReceipt(
                        { hash: txHash }
                    )
                }

                const data = toHex(`Deposited (${value}) of ERC20 (${token}).`);

                const { request } = await client.simulateContract({
                    account: address,
                    address: portalAddress,
                    abi: erc20Portal.abi,
                    functionName: "depositERC20Tokens",
                    args: [token, props.appAddress, value, data]
                });
                const txHash = await walletClient.writeContract(request);

                await client.waitForTransactionReceipt(
                    { hash: txHash }
                )
            }
        } catch (e) {
            if (e instanceof BaseError) {
                console.error(e.message);
            } else {
                console.error(e);
            }
        }
    };

    const transferNftToPortal = async (token: `0x${string}`, nftid: bigint) => {
        try {
            if (chainId) {
                const client = await getClient(chainId);
                const walletClient = await getWalletClient(chainId);

                if (!client || !walletClient) return;

                const [address] = await walletClient.requestAddresses();
                if (!address) return;

                const portalAddress = "0xc700d52F5290e978e9CAe7D1E092935263b60051";

                const currentApproval = await client.readContract({
                    address: token,
                    abi: erc721Abi,
                    functionName: "getApproved",
                    args: [nftid]
                });
                if (currentApproval !== portalAddress) {

                    const { request } = await client.simulateContract({
                        account: address,
                        address: token,
                        abi: erc721Abi,
                        functionName: "approve",
                        args: [portalAddress,nftid]
                    });
                    const txHash = await walletClient.writeContract(request);

                    await client.waitForTransactionReceipt(
                        { hash: txHash }
                    )
                }

                const baseData = toHex(`Base Layer Deposited (${nftid}) of ERC721 (${token}).`);
                const data = toHex(`Exec Layer Deposited (${nftid}) of ERC721 (${token}).`);

                const { request } = await client.simulateContract({
                    account: address,
                    address: portalAddress,
                    abi: erc721Portal.abi,
                    functionName: "depositERC721Token",
                    args: [token, props.appAddress, nftid, baseData, data]
                });
                const txHash = await walletClient.writeContract(request);

                await client.waitForTransactionReceipt(
                    { hash: txHash }
                )
            }
        } catch (e) {
            console.log(`${e}`);
        }
    };

    const transferErc1155SingleToPortal = async (token: `0x${string}`, id: bigint, amount: bigint) => {
        try {
            if (chainId) {

                const client = await getClient(chainId);
                const walletClient = await getWalletClient(chainId);

                if (!client || !walletClient) return;

                const [address] = await walletClient.requestAddresses();
                if (!address) return;

                const portalAddress = "0xc700A261279aFC6F755A3a67D86ae43E2eBD0051";

                const currentApproval = await client.readContract({
                    address: token,
                    abi: erc1155Abi,
                    functionName: "isApprovedForAll",
                    args: [address,portalAddress]
                });
                if (currentApproval) {

                    const { request } = await client.simulateContract({
                        account: address,
                        address: token,
                        abi: erc1155Abi,
                        functionName: "setApprovalForAll",
                        args: [portalAddress,true]
                    });
                    const txHash = await walletClient.writeContract(request);

                    await client.waitForTransactionReceipt(
                        { hash: txHash }
                    )
                }

                const baseData = toHex(`Base Layer Deposited (${amount}) tokens from id (${id}) of ERC1155 (${token}).`);
                const data = toHex(`Exec Layer Deposited (${amount}) tokens from id (${id}) of ERC1155 (${token}).`);

                const { request } = await client.simulateContract({
                    account: address,
                    address: portalAddress,
                    abi: erc1155SinglePortal.abi,
                    functionName: "depositSingleERC1155Token",
                    args: [token, props.appAddress, id, amount, baseData, data]
                });
                const txHash = await walletClient.writeContract(request);

                await client.waitForTransactionReceipt(
                    { hash: txHash }
                )
            }
        } catch (e) {
            console.log(`${e}`);
        }
    };

    const transferErc1155BatchToPortal = async (token: `0x${string}`, ids: bigint[], amounts: bigint[]) => {
        try {
            if (chainId) {

                const client = await getClient(chainId);
                const walletClient = await getWalletClient(chainId);

                if (!client || !walletClient) return;

                const [address] = await walletClient.requestAddresses();
                if (!address) return;

                const portalAddress = "0xc700A2e5531E720a2434433b6ccf4c0eA2400051";

                const currentApproval = await client.readContract({
                    address: token,
                    abi: erc1155Abi,
                    functionName: "isApprovedForAll",
                    args: [address,portalAddress]
                });
                if (currentApproval) {

                    const { request } = await client.simulateContract({
                        account: address,
                        address: token,
                        abi: erc1155Abi,
                        functionName: "setApprovalForAll",
                        args: [portalAddress,true]
                    });
                    const txHash = await walletClient.writeContract(request);

                    await client.waitForTransactionReceipt(
                        { hash: txHash }
                    )
                }
                const baseData = toHex(`Base Layer Deposited (${amounts}) tokens from ids (${ids}) of ERC1155 (${token}).`);
                const data = toHex(`Exec Layer Deposited (${amounts}) tokens from ids (${ids}) of ERC1155 (${token}).`);

                const { request } = await client.simulateContract({
                    account: address,
                    address: portalAddress,
                    abi: erc1155BatchPortal.abi,
                    functionName: "depositBatchERC1155Token",
                    args: [token, props.appAddress, ids, amounts, baseData, data]
                });
                const txHash = await walletClient.writeContract(request);

                await client.waitForTransactionReceipt(
                    { hash: txHash }
                )
            }
        } catch (e) {
            console.log(`${e}`);
        }
    };

    const AddTo1155Batch = () => {
        const newIds = erc1155Ids;
        newIds.push(erc1155Id);
        setErc1155Ids(newIds);
        const newAmounts = erc1155Amounts;
        newAmounts.push(erc1155Amount);
        setErc1155Amounts(newAmounts);
        setErc1155IdsStr("[" + erc1155Ids.join(',') + "]");
        setErc1155AmountsStr("[" + erc1155Amounts.join(',') + "]");
    };

    const Clear1155Batch = () => {
        setErc1155IdsStr("[]");
        setErc1155AmountsStr("[]");
        setErc1155Ids([]);
        setErc1155Amounts([]);
    };

    return (
        <div>
            <div>
                Deposit Ether <br />
                Amount: <input
                    type="number"
                    value={etherAmount}
                    onChange={(e) => setEtherAmount(e.target.value)}
                />
                <button onClick={() => depositEtherToPortal(parseEther(etherAmount))} disabled={!chainId}>
                    Deposit Ether
                </button>
                <br /><br />
            </div>
            <div>
                Deposit ERC20 <br />
                Address: <input
                    type="text"
                    value={erc20Token}
                    onChange={(e) => setErc20Token(e.target.value)}
                />
                Amount: <input
                    type="number"
                    value={erc20Amount}
                    onChange={(e) => setErc20Amount(e.target.value)}
                />
                Decimals: <input
                    type="number"
                    value={erc20Decimals}
                    onChange={(e) => {
                        setErc20Decimals(Number(e.target.value));
                    }}
                />
                <button onClick={() => depositErc20ToPortal(erc20Token as `0x${string}`, parseUnits(erc20Amount,erc20Decimals))} disabled={!chainId}>
                    Deposit ERC20
                </button>
                <br /><br />
            </div>
            <div>
                Transfer ERC721 <br />
                Address: <input
                    type="text"
                    value={erc721}
                    onChange={(e) => setErc721(e.target.value)}
                />
                id: <input
                    type="number"
                    value={erc721Id}
                    onChange={(e) => setErc721Id(e.target.value)}
                />
                <button onClick={() => transferNftToPortal(erc721 as `0x${string}`, BigInt(erc721Id))} disabled={!chainId}>
                    Transfer NFT
                </button>
                <br /><br />
            </div>
            <div>
                Transfer Single ERC1155 <br />
                Address: <input
                    type="text"
                    value={erc1155}
                    onChange={(e) => setErc1155(e.target.value)}
                />
                id: <input
                    type="number"
                    value={erc1155Id}
                    onChange={(e) => setErc1155Id(e.target.value)}
                />
                Amount: <input
                    type="number"
                    value={erc1155Amount}
                    onChange={(e) => setErc1155Amount(e.target.value)}
                />
                <button onClick={() => AddTo1155Batch()} disabled={!chainId}>
                    Add to Batch
                </button>
                <button onClick={() => transferErc1155SingleToPortal(erc1155 as `0x${string}`, BigInt(erc1155Id), BigInt(erc1155Amount))} disabled={!chainId}>
                    Transfer Single 1155
                </button>
                <br />
                Transfer ERC1155 Batch <br />
                <span>Ids: {erc1155IdsStr} - Amounts: {erc1155AmountsStr}  </span>
                <button onClick={() => Clear1155Batch()} disabled={!chainId}>
                    Clear Batch
                </button>
                <button onClick={() => transferErc1155BatchToPortal(erc1155 as `0x${string}`, erc1155Ids.map((v) => BigInt(v)), erc1155Amounts.map((v,) => BigInt(v)))} disabled={!chainId}>
                    Transfer Batch 1155
                </button>
            </div>
        </div>
    );
};
