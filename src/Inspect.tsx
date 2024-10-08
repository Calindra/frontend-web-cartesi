import React, { useState } from "react";
import { fromHex } from 'viem'

import configFile from "./config.json";

const config: any = configFile;

interface Propos {
    chainId:string
}

export const Inspect: React.FC<Propos> = ({chainId}:{chainId:string}) => {
    
    const inspectCall = async (str: string) => {
        let payload = str;
        if (hexData) {
            const uint8array = fromHex(str as `0x${string}`,'bytes');
            payload = new TextDecoder().decode(uint8array);
        }
        if (!chainId){
            return;
        }
        
        let apiURL= ""

        if(config.chains[chainId]?.inspectAPIURL) {
            apiURL = `${config.chains[chainId].inspectAPIURL}/inspect`;
        } else {
            console.error(`No inspect interface defined for chain ${chainId}`);
            return;
        }
        
        let fetchData: Promise<Response>;
        if (postData) {
            const payloadBlob = new TextEncoder().encode(payload);
            fetchData = fetch(`${apiURL}`, { method: 'POST', body: payloadBlob });
        } else {
            fetchData = fetch(`${apiURL}/${payload}`);
        }
        fetchData
            .then(response => response.json())
            .then(data => {
                setReports(data.reports);
                setMetadata({metadata:data.metadata, status: data.status, exception_payload: data.exception_payload});
            });
    };
    const [inspectData, setInspectData] = useState<string>("");
    const [reports, setReports] = useState<string[]>([]);
    const [metadata, setMetadata] = useState<any>({});
    const [hexData, setHexData] = useState<boolean>(false);
    const [postData, setPostData] = useState<boolean>(false);

    return (
        <div>
            <div>
                <input
                    type="text"
                    value={inspectData}
                    onChange={(e) => setInspectData(e.target.value)}
                />
                <input type="checkbox" checked={hexData} onChange={(e) => setHexData(!hexData)}/><span>Raw Hex </span>
                <input type="checkbox" checked={postData} onChange={(e) => setPostData(!postData)}/><span>POST </span>
                <button onClick={() => inspectCall(inspectData)} disabled={!chainId}>
                    Send
                </button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Active Epoch Index</th>
                        <th>Curr Input Index</th>
                        <th>Status</th>
                        <th>Exception Payload</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{metadata.metadata ? metadata.metadata.active_epoch_index : ""}</td>
                        <td>{metadata.metadata ? metadata.metadata.current_input_index : ""}</td>
                        <td>{metadata.status}</td>
                        <td>{metadata.exception_payload ? fromHex(metadata.exception_payload, 'string'): ""}</td>
                    </tr>
                </tbody>
            </table>

            <table>
                <tbody>
                    {reports?.length === 0 && (
                        <tr>
                            <td colSpan={4}>no reports</td>
                        </tr>
                    )}
                    {reports?.map((n: any) => (
                        <tr key={`${n.payload}`}>
                            <td>{fromHex(n.payload, 'string')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
