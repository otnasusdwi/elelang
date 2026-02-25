import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import AppShell from "../components/layout/AppShell";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/home/HomePage";
import AuctionsPage from "../pages/auctions/AuctionsPage";
import AuctionRoomPage from "../pages/auctions/AuctionRoomPage";
import CommodityDetailPage from "../pages/commodities/CommodityDetailPage";
import OrdersPage from "../pages/orders/OrdersPage";
import OrderDetailPage from "../pages/orders/OrderDetailPage";
import DisputesPage from "../pages/disputes/DisputesPage";
import DisputeDetailPage from "../pages/disputes/DisputeDetailPage";
import AdminDisputesPage from "../pages/admin/AdminDisputesPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import MyReviewsPage from "../pages/reviews/MyReviewsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/auctions", element: <AuctionsPage /> },
          { path: "/auctions/:id", element: <AuctionRoomPage /> },
          { path: "/commodities/:id", element: <CommodityDetailPage /> },
          { path: "/orders", element: <OrdersPage /> },
          { path: "/orders/:id", element: <OrderDetailPage /> },
          { path: "/disputes", element: <DisputesPage /> },
          { path: "/disputes/:id", element: <DisputeDetailPage /> },
          { path: "/me", element: <ProfilePage /> },
          { path: "/my-reviews", element: <MyReviewsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={["admin"]} />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/admin", element: <AdminDashboardPage /> },
          { path: "/admin/reports", element: <AdminReportsPage /> },
          { path: "/admin/disputes", element: <AdminDisputesPage /> },
        ],
      },
    ],
  },
]);
