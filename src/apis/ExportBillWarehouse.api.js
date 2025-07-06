import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ExportBillWarehouse = {
    useGetList: function (data, options) {
        const URL = endpoints.exportBillWarehouse.PATH_SEARCH_BILL
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
        const URL = endpoints.exportBillWarehouse.PATH_CREATE_BILL;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.exportBillWarehouse.PATH_DETAIL_BILL;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.exportBillWarehouse.PATH_UPDATE_BILL;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.exportBillWarehouse.PATH_DELETE_BILL;
        return post(URL, data);
    },
    assignApproval: function (data) {
        const URL = endpoints.exportBillWarehouse.PATH_ASSIGN_APPROVAL;
        return post(URL, data);
    },
    submitApproval: function (data) {
        const URL = endpoints.exportBillWarehouse.PATH_APPROVAL_BILL;
        return post(URL, data);
    }
}
