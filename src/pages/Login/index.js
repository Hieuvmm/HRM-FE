import { useEffect, useState } from "react";
import logo from "../../assets/logoApp.svg";
import { Form, Input, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "apis/Auth.api";
import { parseJwt } from "../../utils/helpers";
import { storageKey } from "../../utils/common";
import { AiOutlineUser } from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { AppNotification } from "../../components/Notification/AppNotification";
import { useUserStore } from "../../store/storeUser";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.VITE_HIDE_PASS_SECRET_KEY || "your_secret_key";

export default function Login() {
  const [formErrors, setFormError] = useState({});
  const [form] = Form.useForm();
  const nav = useNavigate();
  const [addUserInfo] = useUserStore((state) => [state.addUserInfo]);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [rememberPassword, setRememberPassword] = useState(false);

  useEffect(() => {
    const accounts = JSON.parse(localStorage.getItem("rememberAccounts")) || [];
    setSavedAccounts(accounts);

    if (accounts.length > 0) {
      form.setFieldsValue({
        username: accounts[0].username,
        password: decryptData(accounts[0].password),
      });
      setRememberPassword(true);
    }
  }, []);
  const handleLogin = () => {
    form
      .validateFields()
      .then((values) => {
        const { username, password } = values;
        const isValid = username && password;
        if (!isValid) {
          const errors = {
            username: !username ? "Nhập tên đăng nhập của bạn" : "",
            password: !password ? "Nhập mật khẩu" : "",
          };
          setFormError(errors);
          return;
        }
        const loginRq = {
          username: username,
          password: password,
        };
        AuthApi.login(loginRq)
          .then((res) => {
            const dataToken = parseJwt(res?.body?.accessToken);
            sessionStorage.setItem(storageKey.USER_ID, dataToken?.userId);
            addUserInfo({ jwtToken: res?.body?.accessToken, ...dataToken });

            // Lưu accessToken vào localStorage để các API khác sử dụng
            localStorage.setItem("accessToken", res?.body?.accessToken);

            if (rememberPassword) {
              const savedAccounts =
                JSON.parse(localStorage.getItem("rememberAccounts")) || [];
              const existingAccount = savedAccounts.find(
                (acc) => acc.username === username
              );

              if (!existingAccount) {
                savedAccounts.push({
                  username,
                  password: encryptData(password),
                });
              }

              localStorage.setItem(
                "rememberAccounts",
                JSON.stringify(savedAccounts)
              );
              localStorage.setItem("rememberMe", "true");
            } else {
              localStorage.removeItem("rememberMe");
            }
            nav("/dashboard");
          })
          .catch((err) => {
            AppNotification.error("Sai tài khoản hoặc mật khẩu");
          });
      })
      .catch((errorInfo) => {
        console.log("Validate Failed:", errorInfo);
      });
  };

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  };

  const decryptData = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return null;
    }
  };
  return (
    <div className="flex justify-center">
      <div className="absolute top-10 left-10">
        <img src={logo} alt={"all"} />
      </div>
      <div className="w-[400px] bg-gray-200 mt-[10%] pb-4 px-10 rounded-xl flex flex-col ">
        <div className="flex justify-center mt-6 mb-4">
          <span className="text-4xl font-bold text-red-700">Đăng nhập</span>
        </div>
        <Form form={form} name="validateOnly" layout="vertical">
          <Form.Item
            label="Tài khoản"
            name="username"
            validateStatus={formErrors["username"] ? "error" : ""}
            help={formErrors["username"] || ""}
          >
            <Input
              className="h-[45px]"
              prefix={<AiOutlineUser color={"#c02627"} size={20} />}
            />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            validateStatus={formErrors["password"] ? "error" : ""}
            help={formErrors["password"] || ""}
          >
            <Input.Password
              className="h-[45px]"
              prefix={<RiLockPasswordLine color={"#c02627"} size={20} />}
            />
          </Form.Item>
          <div className="mb-4 flex items-center">
            <Checkbox
              checked={rememberPassword}
              onChange={(e) => setRememberPassword(e.target.checked)}
            >
              Lưu mật khẩu
            </Checkbox>
            <span className="ml-2 text-xs text-red-500">
              (Chú ý: chỉ sử dụng nội bộ)
            </span>
          </div>
          <div className="mb-4">
            <button
              className="bg-red-700 text-white w-full h-[45px] animate-jump-in hover-slide"
              onClick={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              Đăng nhập
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
