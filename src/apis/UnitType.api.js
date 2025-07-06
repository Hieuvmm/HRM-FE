import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const UnitTypeApi = {
    useGetList: function (data, options) {
        const URL = endpoints.unitType.PATH_LIST_UNIT_TYPE
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
        const URL = endpoints.unitType.PATH_CREATE_UNIT_TYPE
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.unitType.PATH_DETAIL_UNIT_TYPE;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.unitType.PATH_UPDATE_UNIT_TYPE;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.unitType.PATH_DELETE_UNIT_TYPE;
        return post(URL, data);
    }
}
