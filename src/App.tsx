import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { Layer0Page } from "./pages/Layer0Page.tsx";
import { Layer1Page } from "./pages/Layer1Page.tsx";
import { Layer2Page } from "./pages/Layer2Page.tsx";
import { Layer3Page } from "./pages/Layer3Page.tsx";
import { Layer4Page } from "./pages/Layer4Page.tsx";
import { ProgressPage } from "./pages/ProgressPage.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="layer/0" element={<Layer0Page />} />
          <Route path="layer/1" element={<Layer1Page />} />
          <Route path="layer/2" element={<Layer2Page />} />
          <Route path="layer/3" element={<Layer3Page />} />
          <Route path="layer/4" element={<Layer4Page />} />
          <Route path="progress" element={<ProgressPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
