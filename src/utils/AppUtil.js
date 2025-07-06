import {localService, sessionService} from "./storageService";
import {removeUserInfo} from "../store/storeUser";
import {storageKey} from "./common";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import {createStyles} from 'antd-style';
import {AppNotification} from "../components/Notification/AppNotification";

export const checkReturnTrue = (require, dataTrue, dataFalse) => {
    return require ? dataTrue : (dataFalse ? dataFalse : null);
}
export const addItemToList = (newItem, URL, queryClient, data) => {
    queryClient.setQueryData([URL, data], (oldData) => {
        const page = (oldData?.total + 1) / data?.limit;
        return {
            ...oldData,
            body: [
                newItem,
                ...oldData?.body
            ],
            total: oldData?.total + 1,
            lastPage: Math.ceil(page)
        };
    });
};
export const deleteItemToList = (code, URL, queryClient, data) => {
    queryClient.setQueryData([URL, data], (oldData) => {
        const page = (oldData?.total - 1) / data?.limit;
        console.log(page)
        return {
            ...oldData,
            body: oldData?.body.filter(item => item.code !== code),
            total: oldData?.total - 1,
            lastPage: Math.ceil(page)
        };
    });
};
export const updateItemToList = (newItem, URL, queryClient, data) => {
    queryClient.setQueryData([URL, data], (oldData) => {

        return {
            ...oldData,
            body: oldData?.body.map((item) => {
                return item.code === newItem.code ? newItem : item
            })
        };
    });
};

export const dataSource = (data, formSearch) => {
    return data?.filter(item => item.status !== "DELETED")?.map((item, index) => ({
        key: item?.code,
        stt: (formSearch.page - 1) * formSearch.limit + index + 1,
        ...item
    }))
}

export function doLogout() {
    // localService.clear();
    sessionService.clear();
    removeUserInfo();
}

export const handleFormSearch = (setFormSearch, name, value) => {
    setFormSearch((prev) => ({
        ...prev,
        page: 1,
        [name]: value
    }))
}

export const handleSearchForm = (setFormSearch, name, value) => {
    setFormSearch((prev) => ({
        ...prev,
        [name]: value
    }))
}

export const handleFormUpdate = (setFormUpdate, setFormError, name, value) => {
    setFormUpdate((prev) => ({
        ...prev,
        [name]: value
    }))
    setFormError((prev) => ({
        ...prev,
        [name]: ""
    }))
}
export const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {style: 'currency', currency}).format(amount) || null;
}

const numberToWords = (n) => {
    const units = ["", "Nghìn", "Triệu", "Tỷ"];
    const smallNumbers = ["Không", "Một", "Hai", "Ba", "Bốn", "Năm", "Sáu", "Bảy", "Tám", "Chín"];

    const readHundreds = (num) => {
        const hundreds = Math.floor(num / 100);
        const tens = Math.floor((num % 100) / 10);
        const ones = num % 10;
        let result = "";

        if (hundreds > 0) result += smallNumbers[hundreds] + " Trăm ";
        if (tens > 1) result += smallNumbers[tens] + " Mươi ";
        else if (tens === 1) result += "Mười ";
        else if (hundreds > 0 && ones > 0) result += "Lẻ ";

        if (ones > 0) result += smallNumbers[ones];
        return result.trim();
    };

    const readIntegerPart = (num) => {
        const chunks = [];
        while (num > 0) {
            chunks.push(num % 1000);
            num = Math.floor(num / 1000);
        }

        let words = "";
        for (let i = chunks.length - 1; i >= 0; i--) {
            if (chunks[i] > 0) {
                words += readHundreds(chunks[i]) + " " + units[i] + " ";
            }
        }
        return words.trim();
    };

    const readDecimalPart = (num) => {
        const digits = num.toString().split("").map((digit) => smallNumbers[parseInt(digit)]);
        return digits.join(" ");
    };

    // Tách phần nguyên và phần thập phân
    const [integerPart, decimalPart] = n.toString().split(".");
    let result = "";

    if (integerPart) {
        result += readIntegerPart(parseInt(integerPart)) + (decimalPart ? " Phẩy " : "");
    }
    if (decimalPart) {
        result += readDecimalPart(decimalPart);
    }

    return result.trim();
};

export const convertCurrencyToWords = (amount, currency = 'VND') => {
    const words = numberToWords(amount);
    return words + " " + (currency === 'USD' ? "Đô La" : "Đồng");
};
export const handlePermissionApprove = (item) => {
    const permission = "USER";
    const userId = sessionService.get(storageKey.USER_ID);
    const idApproved = item?.approvedDetail ? item?.approvedDetail?.filter(itemDetail => itemDetail.status === "APPROVED")?.map(item => item.userId) : [];
    const idApprove = item?.approveDetail ? item?.approveDetail?.split(",").filter(item => !idApproved.includes(item)) : [];
    return !!(item.status === "REVIEWING" && (permission === "ADMIN" || (!idApproved.includes(userId) && idApprove?.[0] === userId)));
}

export const useHandleAddress = function (options) {
    const URL = 'https://provinces.open-api.vn/api/?depth=3'
    return useQuery({
        queryKey: [URL],
        queryFn: async () => {
            const res = await axios.get(URL) || [];
            return res?.data || [];
        },
        placeholderData: [],
        ...options
    })
}
export const useHandleGetBanks = function (options) {
    const URL = 'https://api.vietqr.io/v2/banks'
    return useQuery({
        queryKey: [URL],
        queryFn: async () => {
            const res = await axios.get(URL) || [];
            return res?.data?.data || [];
        },
        placeholderData: [],
        ...options
    })
}


export const isValidImage = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    return file && allowedTypes.includes(file.type);
};

export const useStyle = createStyles(({css, token}) => {
    const {antCls} = token;
    return {
        customTable: css`
            ${antCls}-table {
                ${antCls}-table-container {
                    ${antCls}-table-body,
                    ${antCls}-table-content {
                        scrollbar-width: thin;
                        scrollbar-color: #eaeaea transparent;
                        scrollbar-gutter: stable;
                    }
                }
            }
        `,
    };
});

export const handleCheckEmptyList = (data, skipFields = []) => {
    return data.every(item =>
        Object.entries(item).every(([key, value]) =>
            skipFields.includes(key) || (value !== "" && value !== null && value !== undefined && value !== 0)
        )
    );
};

export const handleLogMessageError = (error) => {
    const message = error.message;
    if (message) {
        AppNotification.error(message);
    }
}
export const urlToFile = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, {type: blob.type});
};
export const handleAppendFormData = (formData, data) => {
    Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
        } else {
            formData.append(key, value);
        }
    });
};
export const getFileExtensionFromUrl = (url) => {
    return url?.split('.')?.pop()?.toLowerCase();
};

