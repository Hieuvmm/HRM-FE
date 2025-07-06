import React from 'react'
import {Button, ConfigProvider, Space} from "antd";
import {FaPlus} from "react-icons/fa";

function CreateButton(props) {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Button: {
                        colorBorder: '#c02627',
                        colorText: '#c02627',
                        colorBorderHover: '#c02627',
                        colorBorderActive: '#c02627',
                    },
                },
            }}
        >
            <div>
                <Button disabled={props.disabled} type="default" size="large" className={props.className}
                        onClick={props.onClick}>
                    {props.text}{" "}
                    <Space>
                        <FaPlus style={{marginLeft: 5}}/>
                    </Space>
                </Button>
            </div>
        </ConfigProvider>

    )
}

export default CreateButton;
