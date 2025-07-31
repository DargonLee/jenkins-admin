// import { GLOBAL_CONFIG } from "@/global-config";
// import { t } from "@/locales/i18n";
// import userStore from "@/store/userStore";
import axios, { type AxiosRequestConfig, type AxiosError, type AxiosResponse } from "axios";
// import { toast } from "sonner";
// import type { Result } from "#/api";
// import { ResultStuts } from "#/enum";

const axiosInstance = axios.create({
	baseURL: "/api",
	timeout: 50000,
	headers: {
		"Content-Type": "application/json;charset=utf-8",
		accept: "application/json",
	},
});

// axiosInstance.interceptors.request.use(
// 	(config) => {
// 		config.headers.Authorization = "Bearer Token";
// 		return config;
// 	},
// 	(error) => Promise.reject(error),
// );

axiosInstance.interceptors.response.use(
	(res: AxiosResponse) => {
		// 直接返回响应数据，让外部直接使用
		return res.data;
	}
);

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<any, T>(config);
	}
}

export default new APIClient();
