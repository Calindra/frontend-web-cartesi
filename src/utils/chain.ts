import 'viem/window'
import { isHex, fromHex, createPublicClient, http,
    createWalletClient, custom,  WalletClient, PublicClient,
    defineChain} from 'viem'

import { anvil, mainnet, sepolia, Chain } from 'viem/chains';

export interface INodeComponentProps {
    appAddress: `0x${string}`,
    chain:string
}

export const sepolia2 = /*#__PURE__*/ defineChain({
    id: 11_155_111,
    name: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://gateway.tenderly.co/public/sepolia'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://sepolia.etherscan.io',
        apiUrl: 'https://api-sepolia.etherscan.io/api',
      },
    },
    contracts: {
      multicall3: {
        address: '0xca11bde05977b3631167028862be2a173976ca11',
        blockCreated: 751532,
      },
      ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
      ensUniversalResolver: {
        address: '0xc8Af999e38273D658BE1b921b88A9Ddf005769cC',
        blockCreated: 5_317_080,
      },
    },
    testnet: true,
  })

let chains:Record<number, Chain> = {};
chains[mainnet.id] = mainnet;
chains[sepolia.id] = sepolia2;
chains[anvil.id] = anvil;



export function getChain(chainId:number):Chain|null;
export function getChain(chainId:string):Chain|null;
export function getChain(chainId:number|string):Chain|null {
    if (typeof chainId === "string") {
        if (!isHex(chainId)) return null;
        chainId = fromHex(chainId, "number");
    }

    const chain = chains[chainId];
    if (!chain) return null;

    return chain;
}

export async function getClient(chainId:string): Promise<PublicClient|null> {
    const chain = getChain(chainId);
    if (!chain) return null;
    return createPublicClient({ 
        chain: chain,
        transport: http()
    });
}

export async function getWalletClient(chainId:string): Promise<WalletClient|null> {
    if (!window.ethereum) return null;
    const chain = getChain(chainId);
    if (!chain) return null;

    const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
    })
    return createWalletClient({
        account: accounts[0], 
        chain: chain,
        transport: custom(window.ethereum)
    });
}

