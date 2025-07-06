import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { existsSync } from "fs";
import { resolve } from "path";

const createViteConfig = ({ mode }) => {
    // Xác định file env cần load
    const envMode = process.env.NODE_ENV || mode;
    const envFilePath = resolve(process.cwd(), `.env.${envMode}`);
    const envFile = existsSync(envFilePath) ? `.env.${envMode}` : ".env";

    console.log(`...  Loading environment file: ${envFile}`);

    // Load biến môi trường từ file env đã xác định
    const env = loadEnv(envMode, process.cwd(), "");

    return defineConfig({
        plugins: [react(), tsconfigPaths()],
        esbuild: {
            include: /\.js$/,
            exclude: [],
            loader: "jsx",
        },
        define: {
            "process.env": JSON.stringify(env), // Đảm bảo biến môi trường truyền vào đúng format
        },
        optimizeDeps: {
            force: true,
            esbuildOptions: {
                loader: {
                    ".js": "jsx",
                },
            },
        },
        server: {
            host: "127.0.0.1",
            port: 3000,
        },
    });
};

export default createViteConfig;
