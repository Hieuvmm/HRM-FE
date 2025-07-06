import "./style.scss";
import { AppNotification } from "../../components/Notification/AppNotification";
import { Button } from "antd";
import { unstable_HistoryRouter, useNavigate } from "react-router-dom";

function CreateData() {
  const navigate = useNavigate();

  const handleNoti = () => {
    AppNotification.info("diệm");
  };

  const handelPartner = () => {
    navigate("/partner");
  };
  const handelWareHouse = () => {
    navigate("/warehouse");
  };
  const handelContruction = () => {
    navigate("/construction-management");
  };
  return (
    <>
      <div className="rounded-tl-md h-full">
        <div>
          <p onClick={handleNoti}>Tạo mới các hạng mục</p>
          <Button type="primary" onClick={handelPartner}>
            Thêm mới đối tác
          </Button>
        </div>
        <div style={{ marginTop: "24px" }}>
          <Button type="primary" onClick={handelWareHouse}>
            Tạo mới kho hàng
          </Button>
        </div>
        <div style={{ marginTop: "24px" }}>
          <Button type="primary" onClick={handelContruction}>
            Tạo mới dự án
          </Button>
        </div>
      </div>
    </>
  );
}

export default CreateData;
