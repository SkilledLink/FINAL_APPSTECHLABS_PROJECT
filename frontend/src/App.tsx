import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout/AppLayout";
import {
  MarketplacePage,
  RequestServicePage,
  ServiceDetailsPage,
} from "./components/index";
// import { VerificationPage } from "./verification";
// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import MobileNavigation from "./components/MobileNavigation";

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
    <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<PlaceholderPage title="Home Feed" />} />
          <Route
            path="discover"
            element={<PlaceholderPage title="Discover & Search" />}
          />
          <Route path="jobs" element={<PlaceholderPage title="Job Board" />} />
          <Route
            path="portfolio"
            element={<PlaceholderPage title="Portfolio Grid" />}
          />
          <Route
            path="professionals"
            element={<PlaceholderPage title="Professional Network" />}
          />
          <Route
            path="profile"
            element={<PlaceholderPage title="User Profile" />}
          />
          <Route
            path="settings"
            element={<PlaceholderPage title="Settings" />}
          />
          <Route
            path="create"
            element={<PlaceholderPage title="Create Post" />}
          />
          
          <Route
            path="marketplace"
            element={
              <MarketplacePage
                onViewProfile={() => undefined}
                onContact={() => undefined}
              />
            }
          />
          <Route
            path="marketplace/service/:professionalId"
            element={
              <ServiceDetailsPage
                professionalId="1"
                onBack={() => undefined}
                onContact={() => undefined}
              />
            }
          />
          <Route
            path="marketplace/request"
            element={
              <RequestServicePage professionalId="1" onBack={() => undefined} />
            }
          />
          <Route
            path="*"
            element={<PlaceholderPage title="404 - Not Found" />}
          />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
