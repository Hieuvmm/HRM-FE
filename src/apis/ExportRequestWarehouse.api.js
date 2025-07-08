import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ExportRequestWarehouse = {
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
        const URL = endpoints.exportRequestWarehouse.PATH_CREATE_TF_WH;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.exportRequestWarehouse.PATH_DETAIL_TF_WH;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.exportRequestWarehouse.PATH_UPDATE_TF_WH;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.exportRequestWarehouse.PATH_DELETE_TF_WH;
        return post(URL, data);
    },
    assignApproval: function (data) {
        const URL = endpoints.exportRequestWarehouse.PATH_ASSIGN_APPROVAL;
        return post(URL, data);
    },
    submitApproval: function (data) {
        const URL = endpoints.exportRequestWarehouse.PATH_APPROVAL_TF_WH;
        return post(URL, data);
    }
}
