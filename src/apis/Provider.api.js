import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ProviderApi = {
    useGetList: function (data, options) {
        const URL = endpoints.provider.PATH_LIST_PROVIDER
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
        const URL = endpoints.provider.PATH_CREATE_PROVIDER;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.provider.PATH_DETAIL_PROVIDER;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.provider.PATH_UPDATE_PROVIDER;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.provider.PATH_DELETE_PROVIDER
        return post(URL, data);
    }
}
