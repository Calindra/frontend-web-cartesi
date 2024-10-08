
import React, { useEffect, useState } from "react";
import { fromHex } from 'viem'
import { getGraphqlUrl, getReports, PartialReport } from './utils/graphql'


interface Propos {
    chain:string
}

export const Reports: React.FC<Propos> = ({chain}:{chain:string}) => {
    const [fetching, setFetching] = useState<boolean>(false);
    const [error, setError] = useState<string>();
    const [reload, setReload] = useState<number>(0);
    const [reportsData, setReportsData] = useState<PartialReport[]>([]);

    useEffect(() => {
        if (!chain) {
            setError("No connected chain");
            return;
        }
        const url = getGraphqlUrl(chain);
        if (!url) {
            setError("No chain graphql url");
            return;
        }
        setFetching(true);
        getReports(url).then(n => {
            setReportsData(n);
            setFetching(false);
        });

    }, [chain,reload]);

    if (fetching) return <p>Loading...</p>;
    if (error) return <p>Oh no... {error}</p>;

    if (!reportsData) return <p>No reports</p>;

    const reports: PartialReport[] = reportsData.map((node: PartialReport) => {
        const n = node;
        let inputPayload = n?.input?.payload;
        if (inputPayload) {
            try {
                inputPayload = fromHex(inputPayload as `0x${string}`, 'string');
            } catch (e) {
                inputPayload = inputPayload + " (hex)";
            }
        } else {
            inputPayload = "(empty)";
        }
        let payload = n?.payload;
        if (payload) {
            try {
                payload = fromHex(payload as `0x${string}`, 'string');
            } catch (e) {
                payload = payload + " (hex)";
            }
        } else {
            payload = "(empty)";
        }
        return {
            index: n.index,
            payload: `${payload}`,
            input: (n && n.input?.id) ? {id:n.input.id,payload: inputPayload} : undefined,
        };
    }).sort((b: any, a: any) => {
        if (a.input.index === b.input.index) {
            return b.index - a.index;
        } else {
            return b.input.index - a.input.index;
        }
    });

    // const forceUpdate = useForceUpdate();
    return (
        <div>
            <button onClick={() => setReload(reload+1)}>
                Reload
            </button>
            <table>
                <thead>
                    <tr>
                        <th>Input Id</th>
                        <th>Report Index</th>
                        <th>Payload</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.length === 0 && (
                        <tr>
                            <td colSpan={4}>no reports</td>
                        </tr>
                    )}
                    {reports.map((n: any) => (
                        <tr key={`${n.input.index}-${n.index}`}>
                            <td>{n.input.index}</td>
                            <td>{n.index}</td>
                            <td>{n.payload}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};
