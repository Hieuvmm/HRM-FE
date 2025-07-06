import { axios } from "../utils/http";

const API_BASE = "/wms/whs/v1/editor";

// Banner APIs
export const getBanners = () => axios.get(`${API_BASE}/banners`);
export const uploadBanner = (file, label, position) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("label", label);
  formData.append("position", position);
  return axios.post(`${API_BASE}/banners`, formData);
};
export const updateBanner = (id, label, position) =>
  axios.put(`${API_BASE}/banners/${id}`, null, { params: { label, position } });
export const deleteBanner = (ids) =>
  axios.delete(`${API_BASE}/banners`, {
    params: Array.isArray(ids) ? { ids } : { ids: [ids] },
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();
      if (params.ids && Array.isArray(params.ids)) {
        params.ids.forEach((id) => searchParams.append("ids", id));
      }
      return searchParams.toString();
    },
  });

// Content APIs
export const getContents = () => axios.get(`${API_BASE}/contents`);
export const getContent = (position) =>
  axios.get(`${API_BASE}/contents/${position}`);
export const updateContent = (data) =>
  axios.post(`${API_BASE}/contents/save-one`, data);
export const uploadContentImages = (
  position,
  { title, body, type, date, badge, files }
) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("body", body);
  formData.append("type", type);
  formData.append("date", date);
  formData.append("badge", badge);
  files.forEach((file) => formData.append("files", file));
  return axios.post(`${API_BASE}/contents/${position}/upload-images`, formData);
};

export const uploadTempImages = (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("file", file));
  return axios
    .post(`${API_BASE}/upload-image`, formData)
    .then((res) => res.data); // trả về { urls: [...] }
};
