import { apiRequest } from "@/api/client";
import type {
  DashboardDateParams,
  SellerDashboardActivitiesResponse,
  SellerDashboardAlertsResponse,
  SellerDashboardChartsResponse,
  SellerDashboardOverviewResponse,
  SellerDashboardSearchResponse
} from "@/types/sellerDashboard";

const SELLER_DASHBOARD_ENDPOINT = "/seller-dashboard";

interface SellerDashboardParams extends DashboardDateParams {
  seller_id: string;
}

export function getSellerDashboardOverview(params: SellerDashboardParams) {
  return apiRequest<SellerDashboardOverviewResponse>({
    method: "GET",
    url: `${SELLER_DASHBOARD_ENDPOINT}/overview`,
    params
  });
}

export function getSellerDashboardCharts(params: SellerDashboardParams) {
  return apiRequest<SellerDashboardChartsResponse>({
    method: "GET",
    url: `${SELLER_DASHBOARD_ENDPOINT}/charts`,
    params
  });
}

export function getSellerDashboardAlerts(sellerId: string) {
  return apiRequest<SellerDashboardAlertsResponse>({
    method: "GET",
    url: `${SELLER_DASHBOARD_ENDPOINT}/alerts`,
    params: { seller_id: sellerId }
  });
}

export function getSellerDashboardActivities(sellerId: string) {
  return apiRequest<SellerDashboardActivitiesResponse>({
    method: "GET",
    url: `${SELLER_DASHBOARD_ENDPOINT}/recent-activities`,
    params: { seller_id: sellerId }
  });
}

export function searchSellerDashboard(params: { seller_id: string; q: string; page: number; page_size: number }) {
  return apiRequest<SellerDashboardSearchResponse>({
    method: "GET",
    url: `${SELLER_DASHBOARD_ENDPOINT}/search`,
    params
  });
}
