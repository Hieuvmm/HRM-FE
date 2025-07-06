import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const WarehouseApi = {
    useGetList: function (data, options) {
        const URL = endpoints.warehouse.PREFIX_LIST_WAREHOUSE;
        console.log(URL, data)
        return useQuery({
            queryKey: [URL, data],
            queryFn: async () => {
                const res = await post(URL, data);
                console.log(res?.body)
                return res?.body || []
            },
            placeholderData: [],
            ...options
        })
    },

    create: function (data) {
        const URL = endpoints.warehouse.PREFIX_CREATE_WAREHOUSE;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.warehouse.PREFIX_UPDATE_WAREHOUSE;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.warehouse.PREFIX_DELETE_WAREHOUSE;
        return post(URL, data);
    }
}

export const WarehouseDetailApi = {
    useGetList: function (data, options) {
        const URL = endpoints.warehouse.PREFIX_DETAIL_WAREHOUSE
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
}

export const WarehouseMaterialDetailApi = {
    useGetList: function (data, options) {
        const URL = endpoints.warehouse.PREFIX_MATERIAL_DETAIL_WAREHOUSE
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
}