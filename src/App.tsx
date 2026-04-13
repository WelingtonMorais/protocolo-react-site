import React from "react";
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import { RootLayout } from "./app/RootLayout";
import { DashboardLayout } from "./app/DashboardLayout";
import { PrivateRoute } from "./components/PrivateRoute";
import { RoleRoute } from "./components/RoleRoute";

// Auth screens
const LoginScreen = lazy(() =>
  import("./screens/login/index").then((m) => ({ default: m.LoginScreen }))
);
const RegisterScreen = lazy(() =>
  import("./screens/register/index").then((m) => ({ default: m.RegisterScreen }))
);
const ForgotPasswordScreen = lazy(() =>
  import("./screens/forgot-password/index").then((m) => ({ default: m.ForgotPasswordScreen }))
);

// Operator screens
const OperatorDashboard = lazy(() =>
  import("./screens/operator/dashboard/index").then((m) => ({ default: m.OperatorDashboard }))
);
const RegisterPackageScreen = lazy(() =>
  import("./screens/operator/register-package/index").then((m) => ({
    default: m.RegisterPackageScreen,
  }))
);
const FindPackageScreen = lazy(() =>
  import("./screens/operator/find-package/index").then((m) => ({ default: m.FindPackageScreen }))
);
const AccessRequestsScreen = lazy(() =>
  import("./screens/operator/access-requests/index").then((m) => ({
    default: m.AccessRequestsScreen,
  }))
);
const CouriersScreen = lazy(() =>
  import("./screens/operator/couriers/index").then((m) => ({ default: m.CouriersScreen }))
);
const CreateCourierScreen = lazy(() =>
  import("./screens/operator/couriers/manage/create").then((m) => ({
    default: m.CreateCourierScreen,
  }))
);
const EditCourierScreen = lazy(() =>
  import("./screens/operator/couriers/manage/edit").then((m) => ({
    default: m.EditCourierScreen,
  }))
);
const UnitsScreen = lazy(() =>
  import("./screens/operator/units/index").then((m) => ({ default: m.UnitsScreen }))
);
const CondominiumScreen = lazy(() =>
  import("./screens/operator/condominium/index").then((m) => ({ default: m.CondominiumScreen }))
);
const ResidentsScreen = lazy(() =>
  import("./screens/operator/residents/index").then((m) => ({ default: m.ResidentsScreen }))
);
const SubscriptionScreen = lazy(() =>
  import("./screens/operator/subscription/index").then((m) => ({
    default: m.SubscriptionScreen,
  }))
);

// Client screens
const ClientDashboard = lazy(() =>
  import("./screens/client/dashboard/index").then((m) => ({ default: m.ClientDashboard }))
);
const PackagesScreen = lazy(() =>
  import("./screens/client/packages/index").then((m) => ({ default: m.PackagesScreen }))
);
const PackageDetailScreen = lazy(() =>
  import("./screens/client/packages/detail").then((m) => ({ default: m.PackageDetailScreen }))
);
const ClientSettingsScreen = lazy(() =>
  import("./screens/client/settings/index").then((m) => ({ default: m.ClientSettingsScreen }))
);

const Loader = (): React.JSX.Element => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <CircularProgress />
  </Box>
);

const App = (): React.JSX.Element => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route path="/" element={<LoginScreen />} />
          <Route path="/cadastro" element={<RegisterScreen />} />
          <Route path="/recuperar-senha" element={<ForgotPasswordScreen />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Operator routes — EMPLOYEE / ADMIN only */}
              <Route element={<RoleRoute allowedRoles={["EMPLOYEE", "ADMIN"]} />}>
                <Route path="/operador/dashboard" element={<OperatorDashboard />} />
                <Route path="/operador/registrar" element={<RegisterPackageScreen />} />
                <Route path="/operador/entregar" element={<FindPackageScreen />} />
                <Route path="/operador/pedidos" element={<AccessRequestsScreen />} />
                <Route path="/operador/mensageiros" element={<CouriersScreen />} />
                <Route path="/operador/mensageiros/create" element={<CreateCourierScreen />} />
                <Route path="/operador/mensageiros/edit" element={<EditCourierScreen />} />
                <Route path="/operador/unidades" element={<UnitsScreen />} />
                <Route path="/operador/condominio" element={<CondominiumScreen />} />
                <Route path="/operador/moradores" element={<ResidentsScreen />} />
                <Route path="/operador/plano" element={<SubscriptionScreen />} />
              </Route>

              {/* Client routes — CLIENT only */}
              <Route element={<RoleRoute allowedRoles={["CLIENT"]} />}>
                <Route path="/morador/dashboard" element={<ClientDashboard />} />
                <Route path="/morador/pacotes" element={<PackagesScreen />} />
                <Route path="/morador/historico" element={<PackagesScreen />} />
                <Route path="/morador/pacotes/:id" element={<PackageDetailScreen />} />
                <Route path="/morador/configuracoes" element={<ClientSettingsScreen />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
