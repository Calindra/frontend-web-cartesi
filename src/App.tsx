import { FC } from "react";
import { useState } from "react";

import { Network } from "./Network";
// import { Account, WalletOptions } from "./Network";
import { Inspect } from "./Inspect";
import { Input } from "./Input";
import { Portals } from "./Portals";
import { Reports } from "./Reports";
import { Notices } from "./Notices";
import { Vouchers } from "./Vouchers";

const App: FC = () => {
    // const [{ connectedChain }] = useSetChain();
    const [appAddress, setAppAddress] = useState<`0x${string}`|undefined>("0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e");

    const [chainId, setChainId] = useState<string>();

    const connect = (chain:string|undefined,address:string|undefined) => {
      setChainId(chain)
    }
    
    // useEffect(() => {
    //     if (!connectedChain) {
    //         setConnected(false);
    //         return;
    //     }
    //     if (connectedChain?.id === "0x7a69") {
    //         setAppAddress('0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e')
    //     } else {
    //         setAppAddress(undefined);
    //     }
    //     setConnected(true);
    // }, [connectedChain])
    return (
        <div>
            <Network onChange={connect}/>
            { chainId ? <>
                <div>
                    Dapp Address: <input
                        type="text"
                        value={appAddress}
                        onChange={(e) => setAppAddress(e.target.value as `0x${string}`)}
                    />
                    <br /><br />
                </div>
                <h2>Inspect</h2>
                <Inspect chainId={chainId} />
                { appAddress ? <>
                    <h2>Input</h2>
                    <Input appAddress={appAddress} chain={chainId} />
                    <h2>Portals</h2>
                    <Portals chain={chainId} appAddress={appAddress} />
                    <h2>Reports</h2>
                    <Reports chain={chainId} />
                    <h2>Notices</h2>
                    <Notices chain={chainId} />
                    <h2>Vouchers</h2>
                    <Vouchers chain={chainId} appAddress={appAddress} />
                </> : <></> }
            </> : <></>
            }
        </div>
    );
};

export default App;
