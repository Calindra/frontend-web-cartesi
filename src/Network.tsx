import { FC, useState } from "react";
import 'viem/window'

import configFile from "./config.json";

const config: any = configFile;

interface Propos {
    onChange(chain:string|undefined,address:string|undefined):void 
}

export const Network: FC<Propos> = ({onChange}:{onChange(chain:string|undefined,address:string|undefined):void}) => {

    const [chain, setChain] = useState<string|undefined>("0x7a69");
    const [walletAddress, setWalletAddress] = useState<string>();
    
    const accountsChanged = (accounts:string[]) => {
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts.
            setChain(undefined);
            setWalletAddress(undefined);
            onChange(undefined,undefined);
            return;
        } else if (accounts[0] !== walletAddress) {
            // Reload your interface with accounts[0].
            setWalletAddress(accounts[0]);
        }
    };

    const chainChanged = (chainId:string) => {
        window.ethereum?.request({method:"eth_requestAccounts"}).then((accounts) => {
            if (!accounts || accounts.length === 0) {
                setChain(undefined);
                setWalletAddress(undefined);
                onChange(undefined,undefined);
                return;
            }

            setChain(chainId);
            setWalletAddress(accounts[0]);
            onChange(chainId,accounts[0]);
        });
    };

    window.ethereum?.removeListener("accountsChanged", accountsChanged);
    window.ethereum?.removeListener("chainChanged", chainChanged);
    window.ethereum?.on('accountsChanged', accountsChanged);
    window.ethereum?.on("chainChanged", chainChanged);

    async function connect() {
        if (!chain) return;
        try {
            
            if (!window.ethereum) {
                alert("no provider");
                return;
            }

            await window.ethereum?.request(
                {method:"wallet_switchEthereumChain",params:[{chainId:chain}]}
            );

            const accounts = await window.ethereum?.request({method:"eth_requestAccounts"});

            if (!accounts || accounts.length === 0) {
                setChain(undefined);
                setWalletAddress(undefined);
                onChange(undefined,undefined);
                return;
            }

            setWalletAddress(accounts[0]);

            onChange(chain,accounts[0]);

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
        <div>
            <select
                onChange={({ target: { value } }) => {
                    if (config.chains[value] !== undefined) {
                        setChain(value);
                    } else {
                        alert("No deploy on this chain")
                    }
                    }
                }
                value={chain}
                >
                {Object.entries(config.chains).map(([k, v]: [string, any], i) => {
                    return (
                        <option key={k} value={k}>
                            {v.label}
                        </option>
                    );
                })}
            </select>
            <button
                onClick={() =>
                    connect()
                }
            >connect</button>
            </div>
            {walletAddress ? <div>
                Connected wallet: {walletAddress}<br />
            </div> : <></>}
            {walletAddress && chain ? <div>
                Connected chainId: {parseInt(chain?.substring(2) ?? "0", 16)}<br />
            </div> : <></>}
        </div>
    );
};
