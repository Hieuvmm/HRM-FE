import {Button, Tabs} from "antd";
import {useEffect, useRef, useState} from "react";
import {IoClose} from "react-icons/io5";
import AppTable from "../Table/AppTable";

const TabWithClose = ({index, onClose}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            Xuất lần {index}{" "}
            <Button
                type="text"
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            >
                <IoClose/>
            </Button>
        </div>
    );
};

const CustomTabs = ({
                        disabled,
                        selectedTabKey,
                        setSelectedTabKey,
                        columns,
                        detailImMaterial,
                        handleDeleteTime,
                        formCreate,
                    }) => {
    const [formSearch] = useState({
        page: 1,
        limit: 10,
        status: "",
        searchText: "",
    });

    const [totalElement] = useState(1);
    const [totalPages] = useState(1);

    const changeFormSearch = (name, value) => {
    };

    const [tabs, setTabs] = useState([]);

    const deleteFlagRef = useRef(false);

    const createTabs = (uniqueTimes) => {
        const newTabs = uniqueTimes.map((time) => {
            return {
                label:
                    time === "0" ? (
                        "Tất cả"
                    ) : (
                        <TabWithClose
                            index={time}
                            onClose={() => {
                                handleDeleteTime(time);
                                generateTabs();
                            }}
                        />
                    ),
                key: time,
            };
        });

        return newTabs;
    };

    const generateTabs = () => {
        deleteFlagRef.current = true;
        setSelectedTabKey("0");
    };

    useEffect(() => {
        const uniqueTimes = formCreate.productEx.map((item) => item.time);

        if (deleteFlagRef.current === true) {
            deleteFlagRef.current = false;
            setTabs(() => {
                let allTabs = [
                    {
                        label: "Tất cả",
                        key: "0",
                    },
                ];

                const newTabs = createTabs(uniqueTimes);

                const returnTabs = [...allTabs, ...newTabs];

                return returnTabs;
            });
            return;
        }

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

            return returnTabs;
        });
    }, [detailImMaterial, formCreate.productEx]);

    const handleTabChange = (activeKey) => {
        setSelectedTabKey(activeKey);
    };

    const addTab = () => {
        const currentTabIndex = tabs.length;

        const newTab = {
            label: (
                <TabWithClose
                    index={currentTabIndex}
                    onClose={() => {
                        handleDeleteTime(currentTabIndex - 1);
                        generateTabs();
                    }}
                />
            ),
            key: String(currentTabIndex),
        };

        setTabs((prevTabs) => [...prevTabs, newTab]);
    };

    const OperationsSlot = {
        left: (
            <Button disabled={disabled} onClick={addTab} type="primary" style={{marginRight: 10}}>
                Xuất thêm
            </Button>
        ),
    };

    const slot = {
        left: OperationsSlot.left,
    };

    return (
        <>
            <Tabs
                activeKey={selectedTabKey}
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
