import {Modal, Popconfirm, Popover, Tag,} from "antd";
import React, {useEffect, useState} from "react";
import {PiDotsThreeOutlineVerticalFill} from "react-icons/pi";
import AppTable from "../../../components/Table/AppTable";
import AppCreateButton from "../../../components/AppButton/AppCreateButton";
import AppFilter from "../../../components/AppFilter/AppFilter";
import {dataSource, handleFormSearch} from "../../../utils/AppUtil";
import {routes} from "../../../utils/common";
import {AppNotification} from "../../../components/Notification/AppNotification";
import {MaterialApi} from "../../../apis/Material.api";
import {useNavigate} from "react-router-dom";

export default function Material() {

    const [formSearch, setFormSearch] = useState({
        page: 1, limit: 10, status: "", searchText: ""
    });

    const initialModalCreate = {
        status: false, type: "", id: "",
    };
    const [modalCreate, setModalCrete] = useState(initialModalCreate);

    const detailWholeSell = {
        key: 1, value: "", valueType: "NUMBER", positionCode: ""
    }
    const [wholeSell, setWholeSell] = useState([detailWholeSell])
    useEffect(() => {
        console.log(wholeSell)
    }, [wholeSell])

    const {data: materials, refetch} = MaterialApi.useGetList(formSearch, {staleTime: 0, cacheTime: 0})

    useEffect(() => {
        if (modalCreate.id) {
            MaterialApi.detail({id: modalCreate.id}).then((res) => {
                setFormCreate(res.body)
                setWholeSell(res?.body?.detailWholesalePrice?.map((item, index) => (
                    {
                        stt: index + 1, ...item

                    }
                )))
            }).catch((error) => {
                console.log(error);
            })
        }
    }, [modalCreate.id]);
    const content = (record) => {
        return (<div className="p-1 pointer">
            <div className="mb-0 p-2 pr-6 hover:bg-red-100"
                 onClick={() => nav(routes.MATERIAL_UPDATE + record?.code)}>
                Chỉnh sửa
            </div>

            <div className="mb-0 p-2 pr-6 hover:bg-red-100" onClick={() => {
                handleDelete(record);
            }}
            >Xóa
            </div>

        </div>)
    };


    const changeFormSearch = (name, value) => {
        handleFormSearch(setFormSearch, name, value)
    };

    const handleDelete = (record) => {
        if (record.status === "ACTIVE") {
            AppNotification.error("Chỉ được xóa bản ghi không hoạt động");
            return;
        }
        MaterialApi.delete({id: record.id}).then((res) => {
            AppNotification.success("Xóa vật tư thành công");
            refetch()
        }).catch((error) => {
            console.log(error)
        })
    }
    const columns = [{
        title: "STT", dataIndex: "stt", key: "stt",
    }, {
        title: "Mã vật tư", dataIndex: "code", key: "code",
    }, {
        title: "Tên vật tư", dataIndex: "name", key: "name",
    }, {
        title: "Mô tả", dataIndex: "description", key: "description",
    }, {
        title: "Trạng Thái", dataIndex: "status", key: "status", align: "center", render: (text) => {
            return (<Tag color={text === "ACTIVE" ? "green" : "red"}>
                {text === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
            </Tag>);
        },
    }, {
        title: "Tác vụ",
        dataIndex: "tacVu",
        key: "tacVu",
        align: "center",
        render: (text, record) => (<div style={{display: "flex", justifyContent: "center", gap: "10px"}}>
            <Popover placement="top" title={text} content={() => content(record)}>
                <PiDotsThreeOutlineVerticalFill/>
            </Popover>
        </div>),
    },];


    const nav = useNavigate();

    return (
        <React.Fragment>
            <div className="m-[20px] flex">
                <AppCreateButton text={"Thêm mới"} onClick={() => nav(routes.MATERIAL_CREATE)}/>
                <AppFilter placeholder={"Tìm kiếm theo mã hoặc tên"} className="w-[25%] ml-auto mr-5"
                           status={formSearch.status} searchText={formSearch.searchText}
                           changeFormSearch={changeFormSearch}/>
            </div>
            <div className={`pl-4 pr-4`}>
                <AppTable
                    columns={columns}
                    dataSource={dataSource(materials?.body, formSearch)}
                    changeFormSearch={changeFormSearch}
                    formSearch={formSearch}
                    totalElement={materials?.total}
                    totalPages={materials?.lastPage}
                />
            </div>

        </React.Fragment>
);
}
