
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
  DelegateCallVoucher,
  DelegateCallVoucherQuery,
  Proof,
  NoticeQuery,
  NoticeDocument,
  DelegateCallVoucherDocument,
  type DelegateCallVouchersQuery,
  DelegateCallVouchersDocument,
} from "../generated/graphql";

import configFile from "../config.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: any = configFile;


export const getGraphqlUrl = (chainId: string, appAddress: string): string|null => {

    let url = "";

    if(config.chains[chainId]?.graphqlAPIURL) {
        url = `${config.chains[chainId].graphqlAPIURL}/graphql/${appAddress}`;
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


export type PartialProof = Pick<Proof, "__typename" | "outputIndex" | "outputHashesSiblings">;

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

export const getNotice = async (
    url: string,
    outputIndex: number
): Promise<PartialNotice|undefined> => {
    const data:NoticeQuery = await request(url, NoticeDocument,{outputIndex});
    return data?.notice ? data.notice : undefined;
};


export type PartialDelegatedCallVoucher = Pick<
  DelegateCallVoucher,
  "__typename" | "index" | "destination" | "payload"
> & {
  input?: PartialInput;
  proof?: PartialProof | null;
};
export type PartialDelegatedCallVoucherEdge = {
  node: PartialDelegatedCallVoucher;
};
const isPartialDelegateCallVoucherEdge = (
  n: PartialDelegatedCallVoucherEdge | null
): n is PartialDelegatedCallVoucherEdge => n !== null;


export type PartialVoucher = Pick<Voucher,"__typename" | "index" | "destination" | "payload" | "value" > & {
    input?: PartialInput;
    proof?: PartialProof | null;
};
export type PartialVoucherEdge = { node: PartialVoucher };

const isPartialVoucherEdge = (n: PartialVoucherEdge | null): n is PartialVoucherEdge => n !== null;



export const getVouchers = async (
    url: string
): Promise<PartialVoucher[]> => {
    const data = await request<VouchersQuery>(url, VouchersDocument);
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

export const getDelegatedCallVouchers = async(
    url: string
): Promise<PartialDelegatedCallVoucher[]> => {
    const data = await request<DelegateCallVouchersQuery>(url, DelegateCallVouchersDocument);
    if (data?.delegateCallVouchers?.edges) {
        return data.delegateCallVouchers.edges
            .filter(isPartialDelegateCallVoucherEdge)
            .map((e) => e.node);
    } else {
        return [];
    }
}


export const getDelegatedCallVoucher = async(
    url: string,
    outputIndex: number
): Promise<PartialDelegatedCallVoucher|undefined> => {
    const data = await request<DelegateCallVoucherQuery>(url, DelegateCallVoucherDocument,{outputIndex});
    return data?.delegateCallVoucher ? data.delegateCallVoucher : undefined;
}


