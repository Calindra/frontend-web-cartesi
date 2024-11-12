import { FC } from "react";
import { useState } from "react";

import { Network } from "./Network";
import { Inspect } from "./Inspect";
import { Input } from "./Input";
import { Portals } from "./Portals";
import { Reports } from "./Reports";
import { Notices } from "./Notices";
import { Vouchers } from "./Vouchers";

const App: FC = () => {
    const [appAddress, setAppAddress] = useState<`0x${string}`|undefined>("0x75135d8ADb7180640d29d822D9AD59E83E8695b2");

    const [chainId, setChainId] = useState<string>();

    const connect = (chain:string|undefined,_:string|undefined) => {
      setChainId(chain)
    }
    
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
                { appAddress ? <>
                    <h2>Inspect</h2>
                    <Inspect chain={chainId} appAddress={appAddress} />
                    <h2>Input</h2>
                    <Input chain={chainId} appAddress={appAddress} />
                    <h2>Portals</h2>
                    <Portals chain={chainId} appAddress={appAddress} />
                    <h2>Reports</h2>
                    <Reports chain={chainId} appAddress={appAddress} />
                    <h2>Notices</h2>
                    <Notices chain={chainId} appAddress={appAddress} />
                    <h2>Vouchers</h2>
                    <Vouchers chain={chainId} appAddress={appAddress} />
                </> : <></> }
            </> : <></>
            }
        </div>
    );
};

export default App;
