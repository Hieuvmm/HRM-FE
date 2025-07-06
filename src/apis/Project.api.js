import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ProjectApi = {
    useGetProjects: function (data, options) {
        const URL = endpoints.project.PATH_LIST_PROJECT
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
        const URL = endpoints.project.PATH_CREATE_PROJECT;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.project.PATH_DETAIL_PROJECT;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.project.PATH_UPDATE_PROJECT;
        return post(URL, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    delete: function (data) {
        const URL = endpoints.project.PATH_DELETE_PROJECT;
        return post(URL, data);
    },
    assignApproval: function (data) {
        const URL = endpoints.project.PATH_ASSIGN_APPROVAL_PROJECT;
        return post(URL, data);
    },
    approve: function (data) {
        const URL = endpoints.project.PATH_APPROVE_PROJECT;
        return post(URL, data);
    },
}
