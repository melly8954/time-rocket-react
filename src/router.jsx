// src/router.jsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import RocketPage from './pages/RocketPage';
import RocketCreator from './components/rockets/RocketCreator';
import RocketDetail from './components/rockets/RocketDetail';
import CommunityPage from './pages/CommunityPage';
import MeetingsPage from './pages/MeetingsPage';
import FriendsPage from './pages/FriendsPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import PasswordReset from './components/auth/PasswordReset';
import PasswordChange from './components/auth/PasswordChange';
import OAuthRedirect from './components/auth/OAuthRedirect';

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />
  },
  {
    path: "/signup",
    element: <AuthPage initialTab="register" />
  },
  {
    path: "/password-reset",
    element: <PasswordReset />
  },
  {
    path: "/oauth/redirect",
    element: <OAuthRedirect />
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "dashboard",
        element: <DashboardPage />
      },
      {
        path: "password-change/:userId?",
        element: <PasswordChange />
      },
      {
        path: "rockets",
        element: <RocketPage />,
        children: [
          {
            index: true,
            element: <div>로켓 목록</div>
          },
          {
            path: "",
            element: <RocketPage />
          },
          {
            path: "create",
            element: <RocketCreator />
          },
          {
            path: ":id",
            element: <RocketDetail />
          }
        ]
      },
      {
        path: "community",
        element: <CommunityPage />
      },
      {
        path: "meetings",
        element: <MeetingsPage />
      },
      {
        path: "friends",
        element: <FriendsPage />
      },
      {
        path: "settings",
        element: <SettingsPage />
      },
      {
        path: "notifications",
        element: <NotificationsPage />
      }
    ]
  }
]);

export default router;
