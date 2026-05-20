import React from "react";
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#0B0F14", color: "#F4F0E8", padding: "40px", fontFamily: "monospace", minHeight: "100vh" }}>
          <h1 style={{ color: "#B8211A" }}>App Error</h1>
          <pre style={{ whiteSpace: "pre-wrap", color: "#C9920A" }}>{String(this.state.error)}</pre>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px", opacity: 0.7 }}>{this.state.error?.stack}</pre>
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
