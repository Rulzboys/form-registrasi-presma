import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/admin-login");
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  if (loading)
    return <div className="text-center mt-10">Checking session...</div>;

  return children;
}
