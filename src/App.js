import {Navigate, Route, Routes} from "react-router-dom";
import AppLoading from "./components/Loading/AppLoading";
import Login from "./pages/Login";
import {routes} from "./utils/common";
import MainPage from "./routes/MainPage";
import "./styles/index.scss"
import "./styles/global.scss"
import {removeUserInfo, useUserStore} from "./store/storeUser";
import {useState} from "react";
import expireSession from "./assets/expire_session.svg"
import {useIdleTimer} from "react-idle-timer";
import AppSaveButton from "./components/AppButton/AppSaveButton";
import AppModal from "./components/AppModal/AppModal";

function App() {
    const [authorized] = useUserStore((state) => [state.authorized]);
    const [modalShown, setModalShown] = useState(false);
    const idleTimeout = process.env.VITE_IDLE_TIMER_SECOND

    const handleOnIdle = () => {
        removeUserInfo()
        setModalShown(true)
    };
    const handleRedirect = () => {
        setModalShown(false)
    }
    useIdleTimer({
        timeout: idleTimeout && idleTimeout > 0 ? idleTimeout * 60 * 1000 : undefined,
        onIdle: idleTimeout && idleTimeout > 0 && authorized ? handleOnIdle : null,
        debounce: 500,
    });
    return (
        <>
            <AppLoading/>
            <Routes>
                <Route
                    path={routes.LOGIN}
                    element={<Login/>}
                />
                <Route
                    path='*'
                    element={!authorized ? <Navigate to={routes.LOGIN}/> : <MainPage/>}
                    // element={!authorized ? <Navigate to={routes.LOGIN} /> : (sessionService.getObject(storageKey.USER_INFO)?.changedPass.includes("NO") ? <ChangePassword/> : <MainPage />)}
                />
            </Routes>
            <AppModal isOpen={modalShown} className={""}>
                <div className="flex flex-row">
                    <div className="flex mb-2 w-1/4 items-center">
                        <img alt="session" src={expireSession}/>
                    </div>
                    <div className="w-3/4 ml-2">
                        <div className="mt-3">
                            <h2 className="text-[15px] font-[600px]">
                                Phiên truy cập của bạn đã hết hạn, Vui lòng
                                <span className="font-bold"> Đăng nhập </span>
                                lại để tiếp tục!
                            </h2>
                        </div>

                        <AppSaveButton className={"my-3 px-3 h-10"} title={"Đăng nhập"} onClick={() => {
                            handleRedirect();
                        }}/>
                    </div>
                </div>
            </AppModal>
        </>


    );
}

export default App;
