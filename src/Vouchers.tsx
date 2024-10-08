import React, { useEffect, useState } from "react";
import { fromHex } from 'viem'
import { getGraphqlUrl, getVoucher, getVouchers, PartialVoucher } from './utils/graphql'


type ExtendedVoucher = PartialVoucher & {
    executed?: boolean;
};


interface IProps {
    appAddress: `0x${string}`,
    chain:string
}

export const Vouchers: React.FC<IProps> = (props: IProps) => {
    const [fetching, setFetching] = useState<boolean>(false);
    const [error, setError] = useState<string>();
    const [reload, setReload] = useState<number>(0);
    const [vouchersData, setVouchersData] = useState<PartialVoucher[]>([]);
    const [voucherToExecute, setVoucherToExecute] = useState<ExtendedVoucher>();

    useEffect(() => {
        if (!props.chain) {
            setError("No connected chain");
            return;
        }
        const url = getGraphqlUrl(props.chain);
        if (!url) {
            setError("No chain graphql url");
            return;
        }
        setFetching(true);
        getVouchers(url).then(n => {
            setVouchersData(n);
            setFetching(false);
        });

    }, [props.chain,reload]);

    if (fetching) return <p>Loading...</p>;
    if (error) return <p>Oh no... {error}</p>;

    if (!vouchersData) return <p>No vouchers</p>;

    const vouchers: ExtendedVoucher[] = vouchersData.map((node: PartialVoucher) => {
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
            destination: `${n?.destination ?? ""}`, 
            value: n.value,
            input: (n && n.input?.id) ? {id:n.input.id,payload: inputPayload} : undefined,
        };
    }).sort((b: any, a: any) => {
        if (a.input.index === b.input.index) {
            return b.index - a.index;
        } else {
            return b.input.index - a.input.index;
        }
    });

    const loadVoucher = async (outputIndex: number) => {
        const url = getGraphqlUrl(props.chain);
        if (!url) {
            return;
        }
        const voucher = await getVoucher(url,outputIndex);

        // TODO: set was executed

        setVoucherToExecute(voucher);
    };


    // TODO: execute voucher function

    return (
        <div>
            <p>Voucher to execute</p>
        {voucherToExecute ? <table>
            <thead>
                <tr>
                    <th>Input Id</th>
                    <th>Voucher Output Index</th>
                    <th>Destination</th>
                    <th>Action</th>
                    <th>Input Payload</th>
                    {/* <th>Msg</th> */}
                </tr>
            </thead>
            <tbody>
                <tr key={`${voucherToExecute.input?.id}-${voucherToExecute.index}`}>
                    <td>{voucherToExecute.input?.id}</td>
                    <td>{voucherToExecute.index}</td>
                    <td>{voucherToExecute.destination}</td>
                    <td>
                        {/* <button disabled={!voucherToExecute.proof || voucherToExecute.executed} onClick={() => executeVoucher(voucherToExecute)}>{voucherToExecute.proof ? (voucherToExecute.executed ? "Voucher executed" : "Execute voucher") : "No proof yet"}</button> */}
                    </td>
                    <td>{voucherToExecute.input?.payload}</td>
                    {/* <td>{voucherToExecute.msg}</td> */}
                </tr>
            </tbody>
        </table> : <p>Nothing yet</p>}
            <button onClick={() => setReload(reload+1)}>
                Reload
            </button>
            <table>
                <thead>
                    <tr>
                        <th>Input Id</th>
                        <th>Output Index</th>
                        <th>Destination</th>
                        <th>Action</th>
                        <th>Payload</th>
                    </tr>
                </thead>
                <tbody>
                    {vouchers.length === 0 && (
                        <tr>
                            <td colSpan={4}>no vouchers</td>
                        </tr>
                    )}
                    {vouchers.map((n: any) => (
                        <tr key={`${n.input.id}-${n.index}`}>
                            <td>{n.input.id}</td>
                            <td>{n.index}</td>
                            <td>{n.destination}</td>
                            <td>
                                <button onClick={() => loadVoucher(n.index)}>Get Proof</button>
                            </td>
                            <td>{n.payload}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};
