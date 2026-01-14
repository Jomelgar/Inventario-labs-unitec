import {supabase} from "../supabaseClient";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Users from "../pages/Users";

export const authUser = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error(error);
    return false;
  }

  // data.session puede ser null si no hay sesión
  return data.session === null || data.session === undefined ? false : true;
};


export function RedirectUser() {
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data,error } = await supabase.auth.getUser();
      if (!data.user) {
        setRedirect(<Navigate to="/login" replace />);
        return;
      }

      const uuid = data.user.id;
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("uuid", uuid)
        .single();

      if (!profileData) {
        setRedirect(<Navigate to="/dashboard" replace />);
        return;
      }

      if (profileData.isAdmin) {
        setRedirect(<Users />);
      } else {
        setRedirect(
          <Navigate to={`/profile/${profileData.id}`} replace />
        );
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="w-64">
          <div className="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full bg-blue-800 animate-loading-bar"></div>
          </div>
        </div>
      </div>
    );
  }
  return redirect;
}