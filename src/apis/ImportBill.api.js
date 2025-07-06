import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ImportBillApi = {
    useGetList: function (data, options) {
        const URL = endpoints.importBill.PATH_LIST_BILL
        return useQuery({
            queryKey: [URL, data],
            queryFn: async () => {
                const res = await post(URL, data);
                return res?.body || []
            },
            placeholderData: [],
            ...options
        })
    },
    create: function (data) {
        const URL = endpoints.importBill.PATH_CREATE_BILL;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.importBill.PATH_DETAIL_BILL;
        return post(URL, data);
    },
    useGetDetail: function (data, options) {
        const URL = endpoints.importBill.PATH_DETAIL_BILL
        return useQuery({
            queryKey: [URL, data],
            queryFn: async () => {
                const res = await post(URL, data);
                return res?.body || {}
            },
            placeholderData: {},
            ...options
        })
    },
    update: function (data) {
        const URL = endpoints.importBill.PATH_UPDATE_BILL;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.importBill.PATH_DELETE_BILL;
        return post(URL, data);
    },

    assignApproval: function (data) {
        const URL = endpoints.importBill.PATH_ASSIGN_APPROVAL_BILL;
        return post(URL, data);
    },
    approve: function (data) {
        const URL = endpoints.importBill.PATH_APPROVE_BILL;
        return post(URL, data);
    }
}
