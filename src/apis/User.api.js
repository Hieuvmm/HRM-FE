import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const UserApi = {
    create: function (data) {
        const URL = endpoints.user.PATH_CREATE_USER;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.user.PATH_UPDATE_USER;
        return post(URL, data);
    },
    useSearch: function (data, options) {
        const URL = endpoints.user.PATH_SEARCH_USER
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
    delete: function (data) {
        const URL = endpoints.user.PATH_DELETE_USER;
        return post(URL, data);
    },
    updatePass: function (data) {
        const URL = endpoints.user.PATH_UPDATE_PASS;
        return post(URL, data);
    },
    getUserByRole: function (data, options) {
        const URL = endpoints.user.PATH_GET_USER_BY_ROLE
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