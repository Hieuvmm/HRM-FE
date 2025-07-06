import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ParameterApi = {
    useGetList: function (data, options) {
        const URL = endpoints.parameter.PATH_LIST_PARAMETER
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
        const URL = endpoints.parameter.PATH_CREATE_PARAMETER;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.parameter.PATH_DETAIL_PARAMETER;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.parameter.PATH_UPDATE_PARAMETER;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.parameter.PATH_DELETE_PARAMETER
        return post(URL, data);
    }
}
