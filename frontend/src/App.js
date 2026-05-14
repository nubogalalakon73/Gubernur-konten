import "@/index.css";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Bab1 from "@/pages/Bab1";
import Chapter from "@/pages/Chapter";
import BabAll from "@/pages/BabAll";
import Checkout from "@/pages/Checkout";
import Download from "@/pages/Download";
import AIChatWidget from "@/components/AIChatWidget";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/bab1" element={<Bab1 />} />
          <Route path="/bab/all" element={<BabAll />} />
          <Route path="/bab/:n" element={<Chapter />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/download" element={<Download />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <AIChatWidget />
      </BrowserRouter>
      <Toaster
        position="bottom-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "#131A22",
            border: "1px solid rgba(244,240,232,0.1)",
            color: "#F4F0E8",
          },
        }}
      />
    </div>
  );
}

export default App;
