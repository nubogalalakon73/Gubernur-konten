import "@/index.css";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import Admin from "@/pages/Admin";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
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
