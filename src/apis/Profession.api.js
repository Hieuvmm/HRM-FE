import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ProfessionApi = {
    useGetList: function (data, options) {
        const URL = endpoints.profession.PATH_LIST_PROFESSION
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
        const URL = endpoints.profession.PATH_CREATE_PROFESSION;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.profession.PATH_DETAIL_PROFESSION;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.profession.PATH_UPDATE_PROFESSION;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.profession.PATH_DELETE_PROFESSION
        return post(URL, data);
    }
}
