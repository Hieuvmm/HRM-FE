import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ParameterTypeApi = {
    useGetList: function (data, options) {
        const URL = endpoints.parameterType.PATH_LIST_PARAMETER_TYPE
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
        const URL = endpoints.parameterType.PATH_CREATE_PARAMETER_TYPE;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.parameterType.PATH_DETAIL_PARAMETER_TYPE;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.parameterType.PATH_UPDATE_PARAMETER_TYPE;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.parameterType.PATH_DELETE_PARAMETER_TYPE
        return post(URL, data);
    }
}
