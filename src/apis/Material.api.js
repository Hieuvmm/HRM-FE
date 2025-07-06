import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const MaterialApi = {
    useGetList: function (data, options) {
        const URL = endpoints.material.PATH_LIST_MATERIAL
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
        const URL = endpoints.material.PATH_CREATE_MATERIAL;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.material.PATH_DETAIL_MATERIAL;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.material.PATH_UPDATE_MATERIAL;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.material.PATH_DELETE_MATERIAL;
        return post(URL, data);
    },
    fetchByCondition: function (data) {
        const URL = endpoints.material.PATH_FETCH_BY_CONDITION_MATERIAL;
        return post(URL, data);
    }
}
