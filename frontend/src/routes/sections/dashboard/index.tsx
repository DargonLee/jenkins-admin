import { GLOBAL_CONFIG } from "@/global-config";
import DashboardLayout from "@/layouts/dashboard";
import { Navigate, type RouteObject } from "react-router";
import { backendDashboardRoutes } from "./backend";
import { frontendDashboardRoutes } from "./frontend";

const getRoutes = (): RouteObject[] => {
	if (GLOBAL_CONFIG.routerMode === "frontend") {
		return frontendDashboardRoutes;
	}
	return backendDashboardRoutes;
};

export const dashboardRoutes: RouteObject[] = [
	{
		element: <DashboardLayout />,
		children: [{ index: true, element: <Navigate to={GLOBAL_CONFIG.defaultRoute} replace /> }, ...getRoutes()],
	},
];
