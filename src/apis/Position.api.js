import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const PositionApi = {
    useGetList: function (data, options) {
        const URL = endpoints.department.PATH_LIST_DEPARTMENT
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
        const URL = endpoints.department.PATH_CREATE_DEPARTMENT;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.department.PATH_UPDATE_DEPARTMENT;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.department.PATH_DELETE_DEPARTMENT;
        return post(URL, data);
    },
}