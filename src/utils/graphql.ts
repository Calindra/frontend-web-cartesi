
import request from "graphql-request";

import {
    NoticesDocument,
    Notice,
    Input,
    NoticesQuery,
    ReportsDocument,
    Report,
    ReportsQuery,
    VouchersDocument,
    Voucher,
    VoucherDocument,
    VouchersQuery,
    VoucherQuery,
    Proof,
} from "../generated/graphql";

import configFile from "../config.json";

const config: any = configFile;


export const getGraphqlUrl = (chainId: string): string|null => {

    let url = "";

    if(config.chains[chainId]?.graphqlAPIURL) {
        url = `${config.chains[chainId].graphqlAPIURL}/graphql`;
    } else {
        console.error(`No GraphQL interface defined for chain ${chainId}`);
        return null;
    }

    if (!url) {
        return null;
    }
    return url;

}


export type PartialInput = Pick<Input, "id" | "payload">;


export type PartialReport = Pick<Report, "__typename" | "index" | "payload"> & {
    input?: PartialInput;
};
export type PartialReportEdge = { node: PartialReport };

const isPartialReportEdge = (n: PartialReportEdge | null): n is PartialReportEdge => n !== null;

export const getReports = async (
    url: string
): Promise<PartialReport[]> => {
    // list reports using top-level query
    const data:ReportsQuery = await request(url, ReportsDocument);

    if (data?.reports) {
        return data.reports.edges
            .filter(isPartialReportEdge)
            .map((e:PartialReportEdge) => e.node);
    } else {
        return [];
    }
};


export type PartialProof = Pick<Proof, "__typename" | "outputIndex" | "validityInputIndexWithinEpoch" | 
    "validityMachineStateHash" | "validityOutputEpochRootHash" | "validityOutputHashInOutputHashesSiblings" |
    "validityOutputHashesInEpochSiblings" | "validityOutputHashesRootHash" | "validityOutputIndexWithinInput">;

export type PartialNotice = Pick<Notice, "__typename" | "index" | "payload"> & {
    input?: PartialInput;
    proof?: PartialProof | null;
};
export type PartialNoticeEdge = { node: PartialNotice };

const isPartialNoticeEdge = (n: PartialNoticeEdge | null): n is PartialNoticeEdge => n !== null;

export const getNotices = async (
    url: string
): Promise<PartialNotice[]> => {
    const data:NoticesQuery = await request(url, NoticesDocument)

    if (data?.notices?.edges) {
        return data.notices.edges
            .filter(isPartialNoticeEdge)
            .map((e:PartialNoticeEdge) => e.node);
    } else {
        return [];
    }
};




export type PartialVoucher = Pick<Voucher,"__typename" | "index" | "destination" | "payload" | "value" > & {
    input?: PartialInput;
    proof?: PartialProof | null;
};
export type PartialVoucherEdge = { node: PartialVoucher };

const isPartialVoucherEdge = (n: PartialVoucherEdge | null): n is PartialVoucherEdge => n !== null;



export const getVouchers = async (
    url: string
): Promise<PartialVoucher[]> => {
    const data:VouchersQuery = await request(url, VouchersDocument);
    if (data?.vouchers?.edges) {
        return data.vouchers.edges
            .filter(isPartialVoucherEdge)
            .map((e) => e.node);
    } else {
        return [];
    }
};

export const getVoucher = async (
    url: string,
    outputIndex: number
): Promise<PartialVoucher|undefined> => {
    const data:VoucherQuery = await request(url, VoucherDocument,{outputIndex});
    return data?.voucher ? data.voucher : undefined;
};



