import {useEffect, useState} from "react";
import MaterialType from "./MaterialType";
import Material from "./Material";
import Unit from "./UnitType";
import ExchangeRate from "./ExchangeRate";
import Provider from "./Provider";
import {useLocation, useNavigate} from "react-router-dom";

export default function LayoutMaterialCategory() {
    const nav = useNavigate()
    const location = useLocation();
    const [typeMaterial, setTypeMaterial] = useState("/material");
    useEffect(() => {
        if (location.pathname) {
            setTypeMaterial(location.pathname)
            console.log(location.pathname)
        }
    }, [location.pathname])
    const handleGetCategory = () => {
        switch (typeMaterial) {
            case "/material-type":
                return <MaterialType/>;
            case "/material":
                return <Material/>;
            case "/unit-type":
                return <Unit/>;
            case "/exchange-rate":
                return <ExchangeRate/>;
            default:
                return <Provider/>;
        }
    };
    const handleChangeCategory = (type) => {
        nav(type)
    };
    return (
        <div className={"bg-white h-full"}>
            <div
                className="flex"
                style={{borderBottom: "1px #c02627 solid", padding: "10px 20px"}}
            >
                <div
                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                    style={{
                        color: typeMaterial === "/material" ? "#c02627" : null,
                        borderBottom:
                            typeMaterial === "/material" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/material")}
                >
                    Vật tư - nguyên liệu
                </div>
                <div
                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                    style={{
                        color: typeMaterial === "/material-type" ? "#c02627" : null,
                        borderBottom:
                            typeMaterial === "/material-type" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/material-type")}
                >
                    Loại vật tư - Nguyên liệu
                </div>
                <div
                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                    style={{
                        color: typeMaterial === "/unit-type" ? "#c02627" : null,
                        borderBottom: typeMaterial === "/unit-type" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/unit-type")}
                >
                    Đơn vị tính
                </div>
                <div
                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                    style={{
                        color: typeMaterial === "/exchange-rate" ? "#c02627" : null,
                        borderBottom:
                            typeMaterial === "/exchange-rate" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/exchange-rate")}
                >
                    Tỷ giá
                </div>
                <div
                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                    style={{
                        color: typeMaterial === "/provider" ? "#c02627" : null,
                        borderBottom:
                            typeMaterial === "/provider" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/provider")}
                >
                    Nhà cung cấp
                </div>
                {/* <div
          className="mr-[30px] pointer hover:text-[#c02627] text-base"
          style={{
            color: typeMaterial === "policyPrice" ? "#c02627" : null,
            borderBottom:
              typeMaterial === "policyPrice" ? "1px #c02627 solid" : null,
          }}
          onClick={() => handleChangeCategory("policyPrice")}
        >
          Chính sách giá
        </div> */}
            </div>
            <div>{handleGetCategory()}</div>
        </div>
    );
}
