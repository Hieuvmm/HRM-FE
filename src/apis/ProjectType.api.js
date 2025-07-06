import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ProjectTypeApi = {
    useGetProjectTypes: function (data, options) {
        const URL = endpoints.projectType.PATH_LIST_PROJECT_TYPE
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
        const URL = endpoints.projectType.PATH_CREATE_PROJECT_TYPE;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.projectType.PATH_DETAIL_PROJECT_TYPE;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.projectType.PATH_UPDATE_PROJECT_TYPE;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.projectType.PATH_DELETE_PROJECT_TYPE;
        return post(URL, data);
    }
}
