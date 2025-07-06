import {Layout} from 'antd';
import React from 'react';
import {Suspense} from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import AppLoading from "../components/Loading/AppLoading";
import {routes} from "../utils/common";
import {privateRoutes} from "./PrivateRoutes";
import AppSidebar from "../components/AppSidebar/AppSidebar";
import AppHeader from "../components/Header/AppHeader";


const MainPage = () => {
    return (
        <Layout>
            <Suspense fallback={<AppLoading show/>}>
                <AppSidebar/>
                <Layout>
                    <AppHeader/>
                    <div className={"h-[70px]"}></div>
                    <div style={{height: "calc(100% - 70px)"}} className={"px-2.5 pt-3 bg-gray-50"}>

                        <Routes>
                            {privateRoutes.map((route, index) => {
                                const Page = route.component;
                                const path = route.path;

                                return (

                                    <Route
                                        path={path}
                                        element={
                                            path === '/'
                                                ? <Navigate to={routes.LOGIN} replace/>
                                                : <Page/>
                                        }
                                        key={index}
                                    />
                                );
                            })}
                        </Routes>

                    </div>
                </Layout>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </Suspense>
        </Layout>

    );
}

export default MainPage;
