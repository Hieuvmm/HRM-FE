import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const JobTitleApi = {
    useGetList: function (data, options) {
        const URL = endpoints.jobTitle.PATH_LIST_JOB_TITLE
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
        const URL = endpoints.jobTitle.PATH_CREATE_JOB_TITLE;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.jobTitle.PATH_UPDATE_JOB_TITLE;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.jobTitle.PATH_DELETE_JOB_TITLE;
        return post(URL, data);
    },
}
