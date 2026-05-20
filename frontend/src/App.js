import React, { Component } from "react";
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
    this.state = { hasError: false, errorMsg: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error ? error.message : "Unknown error" };
  }
  render() {
    if (this.state.hasError) {
      return React.createElement("div", {
        style: { minHeight:"100vh", background:"#0B0F14", color:"#F4F0E8", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:24, fontFamily:"sans-serif" }
      },
        React.createElement("div", { style:{ fontSize:48 } }, "📖"),
        React.createElement("div", { style:{ fontSize:20, fontWeight:700 } }, "Gubernur Konten"),
        React.createElement("div", { style:{ background:"#131A22", border:"1px solid #B8211A", padding:"12px", maxWidth:500, width:"100%", fontFamily:"monospace", fontSize:12, color:"#ff6b6b", wordBreak:"break-all", marginTop:8 } }, this.state.errorMsg),
        React.createElement("button", { onClick:()=>window.location.reload(), style:{ marginTop:8, padding:"10px 24px", background:"#B8211A", color:"#F4F0E8", border:"none", cursor:"pointer", fontWeight:600 } }, "Refresh")
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    React.createElement(ErrorBoundary, null,
      React.createElement("div", { className: "App" },
        React.createElement(BrowserRouter, null,
          React.createElement(Routes, null,
            React.createElement(Route, { path: "/", element: React.createElement(Landing) }),
            React.createElement(Route, { path: "/bab1", element: React.createElement(Bab1) }),
            React.createElement(Route, { path: "/bab/all", element: React.createElement(BabAll) }),
            React.createElement(Route, { path: "/bab/:n", element: React.createElement(Chapter) }),
            React.createElement(Route, { path: "/checkout", element: React.createElement(Checkout) }),
            React.createElement(Route, { path: "/download", element: React.createElement(Download) }),
            React.createElement(Route, { path: "/admin", element: React.createElement(AdminLogin) }),
            React.createElement(Route, { path: "/admin/dashboard", element: React.createElement(AdminDashboard) })
          ),
          React.createElement(AIChatWidget)
        ),
        React.createElement(Toaster, {
          position: "bottom-center",
          theme: "dark",
          toastOptions: { style: { background:"#131A22", border:"1px solid rgba(244,240,232,0.1)", color:"#F4F0E8" } }
        })
      )
    )
  );
}

export default App;
