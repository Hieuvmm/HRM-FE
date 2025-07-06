import {AppNotification} from "../../../../components/Notification/AppNotification";
import {Button, Select, Table} from "antd";
import React, {useEffect, useState} from "react";

import {AiOutlineClose} from "react-icons/ai";
import {RiSaveLine} from "react-icons/ri";
import {
    checkReturnTrue,
    handleFormUpdate,
    handleLogMessageError,
    isValidImage,
    urlToFile
} from "../../../../utils/AppUtil";
import {errorCodes, errorTexts, routes} from "../../../../utils/common";

import {MaterialApi} from "../../../../apis/Material.api";

import AppFormPage from "../../../../components/AppFormPage/AppFormPage";
import {TiDelete} from "react-icons/ti";
import {GoPlusCircle} from "react-icons/go";
import {MaterialTypeApi} from "../../../../apis/MaterialType.api";
import {UnitTypeApi} from "../../../../apis/UnitType.api";
import {JobPositionApi} from "../../../../apis/JobPosition.api";
import {useNavigate, useParams} from "react-router-dom";
import AppInput from "../../../../components/AppInput/AppInput";
import AppTextArea from "../../../../components/AppTextArea/AppTextArea";
import AppCheckBox from "../../../../components/AppCheckBox/AppCheckBox";
import AppFormTitle from "../../../../components/AppFormPage/AppFormTitle";
import AppSelect from "../../../../components/AppSelect/AppSelect";
import {MdOutlineDelete} from "react-icons/md";
import {ParameterTypeApi} from "../../../../apis/ParameterType.api";
import {ParameterApi} from "../../../../apis/Parameter.api";
import {AppUploadImage} from "../../../../components/AppUpload/AppUploadImage";


export default function CreateMaterial() {
    const {code} = useParams();
    const nav = useNavigate();
    const formFilterData = {
        page: 1, limit: 1000, status: "ACTIVE",
    }
    const initialFormCreate = {
        status: "ACTIVE",
    }
    const [formCreate, setFormCreate] = useState(initialFormCreate);
    const [formErrors, setFormErrors] = useState({})

    const detailWholeSell = {
        key: 1, value: "", valueType: "NUMBER", positionCode: ""
    }
    const parameterMaterialInitial = {
        key: 1, parameterTypeCode: "", parameterCode: ""
    }
    const [wholeSell, setWholeSell] = useState([detailWholeSell] || [])
    const [parameterMaterial, setParameterMaterial] = useState([parameterMaterialInitial] || [])

    const {data: materialTypes} = MaterialTypeApi.useGetMaterialTypes(formFilterData)
    const {data: unitTypes} = UnitTypeApi.useGetList(formFilterData)
    const {data: jobPositions} = JobPositionApi.useGetList(formFilterData)
    const {data: parameterTypes} = ParameterTypeApi.useGetList(formFilterData, {staleTime: 0, cacheTime: 0})
    const {data: parameters} = ParameterApi.useGetList(formFilterData, {staleTime: 0, cacheTime: 0})

    useEffect(() => {
        if (code) {
            MaterialApi.detail({"code": code}).then(async (res) => {
                const dataDetail = res?.body;
                const images = dataDetail?.image?.map((item) => import.meta.env.VITE_URL_MINIO + item);
                const imageFiles = await Promise.all(
                    dataDetail?.image?.map((item, index) =>
                        urlToFile(import.meta.env.VITE_URL_MINIO + item, `image_${index + 1}.jpg`)
                    )
                );
                setFormCreate({...dataDetail, urlImage: images, image: imageFiles})
                setWholeSell(dataDetail?.detailWholesalePrice?.map((item, index) => ({
                    key: index + 1,
                    ...item
                })) || [])
                setParameterMaterial(dataDetail?.parametersMaterials?.map((item, index) => ({
                    key: index + 1,
                    ...item
                })) || [])


            }).catch((error) => {
                handleLogMessageError(error)
            })
        }
    }, [code]);


    const isValidField = (value) => value?.toString().trim() !== "" && value !== undefined && value !== null;

    const validateWholeSell = wholeSell?.every(item =>
        isValidField(item.value) && isValidField(item.valueType) && isValidField(item.positionCode)
    );

    const validateParameterMaterial = parameterMaterial?.every(item =>
        isValidField(item.parameterTypeCode) && isValidField(item.parameterCode)
    );

    const handleSubmit = () => {
        if (!validateParameterMaterial) {
            AppNotification.error("Dữ liệu thông số còn trống");
            return;
        }
        if (!validateWholeSell) {
            AppNotification.error("Dữ liệu bán buôn còn trống");
            return;
        }
        if (formCreate?.image && !Array.isArray(formCreate.image)) {
            AppNotification.error("Vui lòng chọn ảnh");
            return;
        }
        const isValid = formCreate.code && formCreate.name && formCreate.materialTypeCode
            && formCreate.unitTypeCode && formCreate.listPrice && formCreate.sellPrice &&
            formCreate.minInventory && formCreate.origin
        if (!isValid) {
            const errors = {
                code: !formCreate.code ? errorTexts.REQUIRE_FIELD : "",
                name: !formCreate.name ? errorTexts.REQUIRE_FIELD : "",
                materialTypeCode: !formCreate.materialTypeCode ? errorTexts.REQUIRE_FIELD : "",
                unitTypeCode: !formCreate.unitTypeCode ? errorTexts.REQUIRE_FIELD : "",
                listPrice: !formCreate.listPrice ? errorTexts.REQUIRE_FIELD : "",
                sellPrice: !formCreate.sellPrice ? errorTexts.REQUIRE_FIELD : "",
                minInventory: !formCreate.minInventory ? errorTexts.REQUIRE_FIELD : "",
                origin: !formCreate.origin ? errorTexts.REQUIRE_FIELD : "",
            }
            setFormErrors(errors);
            return
        }

        const formData = new FormData();
        formData.append('id', formCreate?.id);
        formData.append('code', formCreate?.code);
        formData.append('name', formCreate?.name);
        formData.append('materialTypeCode', formCreate?.materialTypeCode);
        formData.append('unitTypeCode', formCreate?.unitTypeCode);
        formData.append('listPrice', formCreate?.listPrice);
        formData.append('sellPrice', formCreate?.sellPrice);
        formData.append('origin', formCreate?.origin);
        formData.append('minInventory', formCreate?.minInventory);
        formData.append('description', formCreate?.description);
        formData.append('status', formCreate?.status);
        if (formCreate?.image && Array.isArray(formCreate.image)) {
            formCreate.image.forEach((info, index) => {
                formData.append(`images[${index}]`, info);
            });
        }

        wholeSell?.forEach((info, index) => {
            formData.append(`detailWholesalePrice[${index}].value`, info?.value);
            formData.append(`detailWholesalePrice[${index}].valueType`, info?.valueType);
            formData.append(`detailWholesalePrice[${index}].positionCode`, info?.positionCode);
        });
        parameterMaterial?.forEach((info, index) => {
            formData.append(`parametersMaterials[${index}].parameterTypeCode`, info?.parameterTypeCode);
            formData.append(`parametersMaterials[${index}].parameterCode`, info?.parameterCode);
        });
        if (code) {
            MaterialApi.update(formData).then((res) => {
                nav(routes.MATERIAL)
                AppNotification.success("Cập nhật vật tư thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes(errorCodes.NAME_EXIST)) {
                    setFormErrors({...formErrors, name: errorTexts.DATA_EXIST})
                }
            })
        } else {
            MaterialApi.create(formData).then((res) => {
                nav(routes.MATERIAL)
                AppNotification.success("Thêm mới vật tư thành công");
            }).catch((error) => {
                const errorCode = error.errorCode;
                if (errorCode?.includes(errorCodes.NAME_EXIST)) {
                    setFormErrors({...formErrors, name: errorTexts.DATA_EXIST})
                }
                if (errorCode?.includes(errorCodes.CODE_EXIST)) {
                    setFormErrors({...formErrors, code: errorTexts.DATA_EXIST})
                }
            })
        }
    }


    const handleAddWholeSell = () => {
        setWholeSell(prev => [...prev, {
            key: prev?.length + 1, value: "", valueType: "NUMBER", priceType: "", applyPrice: ""
        }])
    }
    const changeWholeSell = (key, name, value) => {
        setWholeSell((prev) => {
            const index = prev.findIndex(item => item.key === key);
            const newList = [...prev];
            newList[index] = {...newList[index], [name]: value};
            return newList;
        })
    }
    const handleAddNewParameter = () => {
        setParameterMaterial(prev => [
            ...prev,
            {
                key: prev.length > 0 ? prev.length + 1 : 1,
                parameterTypeCode: "",
                parameterCode: ""
            }
        ]);
    };
    const handleChangeParameter = (key, name, value) => {
        setParameterMaterial((prev) => {
            const index = prev.findIndex(item => item.key === key);
            const newList = [...prev];
            newList[index] = {...newList[index], [name]: value};
            return newList;
        })
    }
    const handleChooseFile = (files, fileUrls) => {
        files?.map((item) => {
            if (!isValidImage(item)) {
                AppNotification.error("Bạn đã chọn sai định dạng ảnh, vui lòng chọn lại")
                return;
            }
        })

        setFormCreate({...formCreate, image: files, urlImage: fileUrls})
        console.log({...formCreate, image: files, urlImage: fileUrls})
    }
    const actionPage = () => {
        return (
            <>
                <Button
                    style={{marginLeft: "auto", marginRight: 10}}
                    key="submit"
                    title="Thêm"
                    onClick={() => nav(routes.MATERIAL)}
                >
                    <AiOutlineClose/> Hủy
                </Button>
                <Button
                    className="button-add-promotion bg-red-700 text-[white]"
                    key="submit"
                    title="Thêm"
                    onClick={() => {
                        handleSubmit();
                    }}
                >
                    <RiSaveLine/> Lưu lại
                </Button>
            </>
        )
    }

    const columnParameters = [
        {
            title: "STT",
            dataIndex: "key",
            key: "key",
        },
        {
            title: "Thông số",
            dataIndex: "parameterTypeCode",
            key: "parameterTypeCode",
            render: (_, record) => (
                <AppSelect value={record?.parameterTypeCode}
                           options={parameterTypes?.body?.map((item) => ({
                               label: item?.name,
                               value: item?.code
                           }))}
                           onChange={(value) => handleChangeParameter(record?.key, "parameterTypeCode", value)}
                />
            ),
        },
        {
            title: "Giá trị",
            dataIndex: "parameterCode",
            key: "parameterCode",
            render: (_, record) => {
                const filterParameter = parameters?.body?.filter((item) => item?.parameterTypeCode === record.parameterTypeCode);
                return (
                    <AppSelect
                        value={record?.parameterCode}
                        options={record?.parameterTypeCode ? filterParameter?.map((item) => ({
                            label: item?.name,
                            value: item?.code
                        })) : []}
                        onChange={(value) => handleChangeParameter(record?.key, "parameterCode", value)}
                    />)

            },
        },
        {
            title: "Thao tác",
            align: "center",
            render: (_, record) => (
                <div className={"flex justify-center w-full h-full"}>
                    {
                        parameterMaterial.length > 1 &&
                        <MdOutlineDelete
                            className="text-gray-800 pointer mt-[5px]" size={25} onClick={() => {
                            const dataFilter = parameterMaterial
                                .filter(itemValue => record?.key !== itemValue.key)
                                .map((item, index) => ({
                                    ...item,
                                    key: index + 1
                                }));

                            setParameterMaterial(dataFilter);
                        }}/>
                    }

                </div>
            ),
        },
    ];

    const columnListPrices = [
        {
            title: "STT",
            dataIndex: "key",
            key: "key",
        },
        {
            title: "Áp dụng",
            dataIndex: "positionCode",
            key: "positionCode",
            render: (_, record) => (
                <AppSelect value={record?.positionCode}
                           options={jobPositions?.body?.map((item) => ({
                               label: item?.name,
                               value: item?.code
                           }))}
                           onChange={(value) => changeWholeSell(record?.key, "positionCode", value)}
                />
            ),
        },
        {
            title: "Loại giá",
            dataIndex: "valueType",
            key: "valueType",
            render: (_, record) => (
                <AppSelect value={record?.valueType}
                           options={
                               [
                                   {
                                       label: "Số",
                                       value: "NUMBER"
                                   },
                                   {
                                       label: "%",
                                       value: "PERCENT"
                                   }
                               ]
                           }
                           onChange={(value) => changeWholeSell(record?.key, "valueType", value)}
                />
            ),
        },
        {
            title: "Giá trị",
            dataIndex: "value",
            key: "value",
            render: (_, record) => (
                <AppInput value={record?.value}
                          onChange={(e) => changeWholeSell(record?.key, "value", e.target.value)}
                          min={1}
                          type={"number"}
                />
            ),
        },
        {
            title: "Thao tác",
            align: "center",
            width: 100,
            render: (_, record) => (
                <div className={"flex justify-center w-full h-full"}>
                    {
                        wholeSell.length > 1 &&
                        <MdOutlineDelete
                            className="text-gray-800 pointer mt-[5px]" size={25} onClick={() => {
                            const dataFilter = wholeSell
                                .filter(itemValue => record?.key !== itemValue.key)
                                .map((item, index) => ({
                                    ...item,
                                    key: index + 1
                                }));

                            setWholeSell(dataFilter);
                        }}/>
                    }

                </div>
            )
        }
    ];
    return (
        <AppFormPage title={` ${code ? "Cập nhật" : "Thêm mới"} vật tư - nguyên liệu`} redirect={routes.MATERIAL}
                     action={actionPage()}>
            <form>
                <AppFormTitle title={"Thông tin chung"}>
                    <div className={`grid grid-cols-3 gap-[4%]`}>
                        <AppSelect className={"mb-5"} label={"Loại vật tư"} value={formCreate?.materialTypeCode}
                                   options={materialTypes?.body?.map((item) => ({
                                       label: item?.name,
                                       value: item?.code
                                   }))}
                                   onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "materialTypeCode", value)}
                                   required={true}
                                   error={formErrors?.materialTypeCode}
                        />
                        <AppInput className={"mb-5"} label={"Mã vật tư"} value={formCreate?.code}
                                  onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "code", e.target.value)}
                                  required={true} error={formErrors?.code}
                        />
                        <AppInput className={"mb-5"} label={"Tên vật tư"} value={formCreate?.name}
                                  onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "name", e.target.value)}
                                  required={true} error={formErrors?.name}/>

                        <AppSelect className={"mb-5"} label={"Đơn vị tính"} value={formCreate?.unitTypeCode}
                                   options={unitTypes?.body?.map((item) => ({
                                       label: item?.name,
                                       value: item?.code
                                   }))}
                                   onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "unitTypeCode", value)}
                                   error={formErrors?.unitTypeCode}
                                   required={true}/>
                        <AppInput className={"mb-5"} label={"Giá niêm yết"}
                                  value={formCreate?.listPrice ? formCreate.listPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""}
                                  onChange={(e) => {
                                      let rawValue = e.target.value.replace(/\./g, "");
                                      if (/^\d*$/.test(rawValue)) {
                                          handleFormUpdate(setFormCreate, setFormErrors, "listPrice", rawValue);
                                      }
                                  }}
                                  required={true}
                                  error={formErrors?.listPrice}
                                  type={"text"}
                                  inputMode="numeric"
                        />
                        <AppInput className={"mb-5"} label={"Số lượng tồn tối thiểu"}
                                  value={formCreate?.minInventory}
                                  onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "minInventory", e.target.value)}
                                  required={true} error={formErrors?.minInventory}
                                  type={"number"}
                                  min={1}
                        />
                        <AppInput className={"mb-5"} label={"Giá bán"} value={formCreate?.sellPrice}
                                  onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "sellPrice", e.target.value)}
                                  required={true} error={formErrors?.sellPrice}
                                  type={"number"}
                                  min={1}
                        />
                        <AppInput className={"mb-5"} label={"Nguồn gốc"}
                                  value={formCreate?.origin}
                                  onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "origin", e.target.value)}
                                  required={true} error={formErrors?.origin}
                        />
                        <AppCheckBox
                            checked={formCreate?.status === "ACTIVE"}
                            onChange={(value) => handleFormUpdate(setFormCreate, setFormErrors, "status", value.target.checked ? "ACTIVE" : "INACTIVE")}
                            label="Hoạt động"
                        />
                    </div>
                    <AppTextArea
                        className={"mt-7"}
                        label={"Mô tả"}
                        value={formCreate["description"] || ""}
                        onChange={(e) => handleFormUpdate(setFormCreate, setFormErrors, "description", e.target.value)}
                    />
                </AppFormTitle>

                <AppFormTitle title={"Thông số bổ sung"}>
                    <Table dataSource={parameterMaterial} pagination={false} columns={columnParameters}/>
                    <div
                        className="flex items-center justify-center mb-10 hover:text-teal-900 w-32 h-10 pointer border-teal-700 rounded-[5px] border-[1px] mt-3"
                        onClick={handleAddNewParameter}>Thêm dữ liệu <GoPlusCircle
                        color={"teal"} size={17} className="ml-2"/>
                    </div>
                </AppFormTitle>

                <AppFormTitle title={"Giá bán buôn"}>

                    <Table dataSource={wholeSell} pagination={false} columns={columnListPrices}/>

                    <div
                        className="flex items-center justify-center mb-10 hover:text-teal-900 w-32 h-10 pointer border-teal-700 rounded-[5px] border-[1px] mt-3"
                        onClick={handleAddWholeSell}>Thêm dữ liệu <GoPlusCircle
                        color={"teal"} size={17} className="ml-2"/>
                    </div>
                </AppFormTitle>

                <AppFormTitle title={"Ảnh vật tư"}>
                    <AppUploadImage type={"multi"} onChange={(file, fileUrl) => handleChooseFile(file, fileUrl)}
                                    path={formCreate?.urlImage ? formCreate?.urlImage : formCreate?.image ? formCreate?.image : null}
                                    files={formCreate?.image}
                    />
                </AppFormTitle>
            </form>
        </AppFormPage>
    );
}



