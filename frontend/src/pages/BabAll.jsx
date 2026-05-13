import { Navigate, useSearchParams } from "react-router-dom";

export default function BabAll() {
  const [params] = useSearchParams();
  const t = params.get("t");
  const to = t ? `/bab/2?t=${encodeURIComponent(t)}` : "/bab/2";
  return <Navigate to={to} replace />;
}
