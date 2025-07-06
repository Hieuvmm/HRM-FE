import {useEffect, useState} from "react";
import Account from "./Account";
import PositionJob from "./PositionJob";
import TitleJob from "./TitleJob";
import Department from "./Department";
import Branch from "./Branch";
import {useLocation, useNavigate} from "react-router-dom";

export default function SystemManagement() {
    const [type, setType] = useState("account");
    const nav = useNavigate()
    const location = useLocation();
    useEffect(() => {
        if (location.pathname) {
            setType(location.pathname)
        }
    }, [location.pathname])
    const handleGetCategory = () => {
        switch (type) {
            case "/account":
                return <Account/>;
            case "/job-position":
                return <PositionJob/>;
            case "/job-title":
                return <TitleJob/>;
            case "/branch":
                return <Branch/>;
            default:
                return <Department/>;
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
                        color: type === "/account" ? "#c02627" : null,
                        borderBottom: type === "/account" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/account")}
                >
                    Tài khoản
                </div>
                <div
                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                    style={{
                        color: type === "/job-position" ? "#c02627" : null,
                        borderBottom: type === "/job-position" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/job-position")}
                >
                    Chức vụ
                </div>
                <div
                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                    style={{
                        color: type === "/job-title" ? "#c02627" : null,
                        borderBottom: type === "/job-title" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/job-title")}
                >
                    Chức danh
                </div>
                <div
                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                    style={{
                        color: type === "/department" ? "#c02627" : null,
                        borderBottom: type === "/department" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/department")}
                >
                    Phòng ban
                </div>
                <div
                    className="mr-[30px] pointer hover:text-[#c02627] text-base"
                    style={{
                        color: type === "/branch" ? "#c02627" : null,
                        borderBottom: type === "/branch" ? "1px #c02627 solid" : null,
                    }}
                    onClick={() => handleChangeCategory("/branch")}
                >
                    Chi nhánh
                </div>
            </div>
            <div>{handleGetCategory()}</div>
        </div>
    );
}
