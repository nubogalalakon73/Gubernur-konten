import { Component } from "react";
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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#0B0F14", color: "#F4F0E8", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
          <div style={{ fontSize: 48 }}>📖</div>
          <div style={{ fontFamily: "serif", fontSize: 24, fontWeight: 700 }}>Gubernur Konten</div>
          <div style={{ color: "rgba(244,240,232,0.6)", textAlign: "center", maxWidth: 320 }}>Terjadi kesalahan. Silakan refresh halaman.</div>
          <button onClick={() => window.location.href = "/"} style={{ marginTop: 8, padding: "10px 24px", background: "#B8211A", color: "#F4F0E8", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Kembali ke Beranda
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
