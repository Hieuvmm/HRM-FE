import "./style.scss";
import {IoLogOutOutline} from "react-icons/io5";
import {AuthApi} from "../../apis/Auth.api";
import {AppNotification} from "../Notification/AppNotification";
import {routes} from "../../utils/common";
import {useNavigate} from "react-router-dom";
import {doLogout} from "../../utils/AppUtil";

const Header = () => {
    const nav = useNavigate()
    const handleLogout = () => {
        AuthApi.logout({logout: ''}).then((res) => {
            doLogout()
            nav(routes.LOGIN)
        }).catch((err) => {
            AppNotification.error("Đăng xuất không thành công")
        })
    }
    return (
        <>
            <header className="header">
                <div className="container-header">
                    <IoLogOutOutline title="Đăng xuất" size={25} className="ml-[80%] pointer"
                                     onClick={() => handleLogout()}/>
                </div>
            </header>

        </>
    );
};

export default Header;
