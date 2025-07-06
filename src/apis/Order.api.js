import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const OrderApi = {
    useGetOrders: function (data, options) {
        const URL = endpoints.order.PATH_LIST_ORDER;
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
        const URL = endpoints.order.PATH_CREATE_ORDER;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.order.PATH_UPDATE_ORDER;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.order.PATH_DETAIL_ORDER;
        return post(URL, data);
    },
    updateStatus: function (data) {
        const URL = endpoints.order.PATH_UPDATE_STATUS_ORDER;
        return post(URL, data);
    },
    assignApproval: function (data) {
        const URL = endpoints.order.PATH_ASSIGN_APPROVAL_ORDER;
        return post(URL, data);
    },
    approval: function (data) {
        const URL = endpoints.order.PATH_APPROVAL_ORDER;
        return post(URL, data);
    },
}
