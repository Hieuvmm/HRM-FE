import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const JobPositionApi = {
    useGetList: function (data, options) {
        const URL = endpoints.jobPosition.PATH_LIST_JOB_POSITION
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
        const URL = endpoints.jobPosition.PATH_CREATE_JOB_POSITION;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.jobPosition.PATH_UPDATE_JOB_POSITION;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.jobPosition.PATH_DELETE_JOB_POSITION;
        return post(URL, data);
    },
}
