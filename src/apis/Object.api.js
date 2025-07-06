import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ObjectApi = {
    useGetObjects: function (data, options) {
        const URL = endpoints.object.PATH_LIST_OBJECT
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
        const URL = endpoints.object.PATH_CREATE_OBJECT;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.object.PATH_DETAIL_OBJECT;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.object.PATH_UPDATE_OBJECT;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.object.PATH_DELETE_OBJECT;
        return post(URL, data);
    }
}
