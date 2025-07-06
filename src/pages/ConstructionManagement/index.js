import React, { useEffect, useState } from "react";
import ProjectType from "./ProjectType";
import Project from "./Project";
import ProjectCategory from "./ProjectCategory";
import { checkReturnTrue, dataSource } from "../../utils/AppUtil";
import { useLocation, useNavigate } from "react-router-dom";
import AppCreateButton from "../../components/AppButton/AppCreateButton";
import { routes } from "../../utils/common";
import AppFilter from "../../components/AppFilter/AppFilter";
import AppTable from "../../components/Table/AppTable";
import AppFormPage from "../../components/AppFormPage/AppFormPage";

export default function ConstructionManagement() {
  const [type, setType] = useState("project");
  const nav = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname) {
      setType(location.pathname);
    }
  }, [location.pathname]);
  const handleGetType = () => {
    switch (type) {
      case "/project-type":
        return <ProjectType />;
      case "/project":
        return <Project />;
      case "/project-category":
        return <ProjectCategory />;
      default:
        return;
    }
  };
  const handleChangeType = (type) => {
    nav(type);
  };
  return (
    <div className={"bg-white h-full"}>
      <div
        className="flex "
        style={{ borderBottom: "1px #c02627 solid", padding: "10px 20px" }}
      >
        <div
          className="mr-[30px] pointer hover:text-[#c02627] text-base "
          style={{
            color: type === "/project" ? "#c02627" : null,
            borderBottom: type === "/project" ? "1px #c02627 solid" : null,
          }}
          onClick={() => handleChangeType("/project")}
        >
          Công trình
        </div>
        <div
          className="mr-[30px] pointer hover:text-[#c02627] text-base"
          style={{
            color: type === "/project-type" ? "#c02627" : null,
            borderBottom: type === "/project-type" ? "1px #c02627 solid" : null,
          }}
          onClick={() => handleChangeType("/project-type")}
        >
          Loại công trình
        </div>
        <div
          className="mr-[30px] pointer hover:text-[#c02627] text-base"
          style={{
            color: type === "/project-category" ? "#c02627" : null,
            borderBottom:
              type === "/project-category" ? "1px #c02627 solid" : null,
          }}
          onClick={() => handleChangeType("/project-category")}
        >
          Hạng mục công trình
        </div>
      </div>
      <div>{handleGetType()}</div>
    </div>
  );
}
