import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const MaterialTypeApi = {
    useGetMaterialTypes: function (data, options) {
        const URL = endpoints.materialType.PATH_LIST_MATERIAL_TYPE
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
        const URL = endpoints.materialType.PATH_CREATE_MATERIAL_TYPE;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.materialType.PATH_DETAIL_MATERIAL_TYPE;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.materialType.PATH_UPDATE_MATERIAL_TYPE;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.materialType.PATH_DELETE_MATERIAL_TYPE;
        return post(URL, data);
    }
}
