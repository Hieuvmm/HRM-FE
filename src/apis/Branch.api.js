import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const BranchApi = {
    useGetList: function (data, options) {
        const URL = endpoints.branch.PATH_LIST_BRANCH
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
        const URL = endpoints.branch.PATH_CREATE_BRANCH;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.branch.PATH_UPDATE_BRANCH;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.branch.PATH_DELETE_BRANCH;
        return post(URL, data);
    },
}
