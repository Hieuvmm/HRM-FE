import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Button, Tabs} from 'antd';
import AppTable from "../Table/AppTable";

const CustomTabs = ({
                        columns,
                        detailImMaterial,
                        handleChangeTab,
                        timeExport,
                        setTotalPrice,
                    }) => {
    const [formSearch, setFormSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: "",
    });
    console.log("detailImMaterial_abc", detailImMaterial)

    const [totalElement, setTotalElement] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const changeFormSearch = (name, value) => {
    };

    const [tabs, setTabs] = useState([]);
    const tabIndexRef = useRef(1);

    // Hàm để lấy các giá trị time duy nhất
    const getUniqueTimes = (data) => {
        const times = data.map((item) => item.time);
        return [...new Set(times)];
    };

    const calculateTotalPrice = (data) => {
        return data.reduce((accumulator, currentValue) => {
            return parseInt(accumulator) + parseInt(currentValue.totalPrice); // Đảm bảo totalPrice là số
        }, 0);
    };

    const createTabs = (uniqueTimes) => {
        const newTabs = uniqueTimes.map((time) => {
            const filteredData = detailImMaterial.filter(
                (item) => item.time === time
            );
            const totalPrice = calculateTotalPrice(filteredData); // Tính totalPrice cho tab này

            setTotalPrice(totalPrice);

            return {
                label: time === "0" ? "Tất cả" : `Xuất lần ${time}`,
                key: time,
                children: (
                    <AppTable
                        columns={columns}
                        dataSource={filteredData}
                        changeFormSearch={changeFormSearch}
                        formSearch={formSearch}
                        totalElement={totalElement}
                        totalPages={totalPages}
                    />
                ),
            };
        });

        return newTabs;
    };
    console.log(
        "detailImMaterial, tabs, setTotalPrice",
        detailImMaterial,
        tabs,
        setTotalPrice
    );
    useEffect(() => {
        const uniqueTimes = getUniqueTimes(detailImMaterial);

        setTabs((prevTabs) => {
            const existingTabKeys = prevTabs.map((tab) => tab.key);

            let allTabs = prevTabs.filter((tab) => tab.key !== "0");

            allTabs = [
                {
                    label: "Tất cả",
                    key: "0",
                },
                ...allTabs,
            ];

            const newTabs = createTabs(uniqueTimes);

            const filteredTabs = newTabs.filter(
                (tab) => !existingTabKeys.includes(tab.key)
            );
            const returnTabs = [...allTabs, ...filteredTabs];

            tabIndexRef.current = returnTabs.length;

            return returnTabs;
        });
    }, [detailImMaterial, setTotalPrice]);

    const handleTabChange = (activeKey) => {
        if (handleChangeTab) {
            handleChangeTab(activeKey);
        }
    };

    const addTab = () => {
        const currentTabIndex = tabIndexRef.current;

        const tabKey = `Xuất lần ${currentTabIndex}`;
        const existingTab = tabs.find((tab) => tab.label === tabKey);

        timeExport(currentTabIndex);

        if (!existingTab) {
            const newTab = {
                label: `Xuất lần ${currentTabIndex}`,
                key: String(currentTabIndex),
            };

            setTabs((prevTabs) => [...prevTabs, newTab]);
            tabIndexRef.current += 1;
        }
    };

    const OperationsSlot = {
        left: (
            <Button onClick={addTab} type="primary" style={{marginRight: 10}}>
                Xuất thêm
            </Button>
        ),
    };

    const slot = useMemo(
        () => ({
            left: OperationsSlot.left,
        }),
        []
    );
    console.log("detailImMaterialdetailImMaterial", detailImMaterial);
    return (
        <>
            <Tabs
                defaultActiveKey="0"
                tabPosition="top"
                tabBarExtraContent={slot}
                items={tabs.map((tab) => ({
                    label: tab.label,
                    key: tab.key,
                }))}
                onChange={handleTabChange}
            />
            <AppTable
                columns={columns}
                dataSource={detailImMaterial}
                changeFormSearch={changeFormSearch}
                formSearch={formSearch}
                totalElement={totalElement}
                totalPages={totalPages}
            />
        </>
    );
};

export default CustomTabs;