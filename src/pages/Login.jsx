import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Form } from "antd";
import {supabase} from "../supabaseClient";

export default function LoginUI({ setUserEmail }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error,setError] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Aquí verificamos si el usuario existe y la contraseña es correcta
      const { data: user, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });
      const userUuid = user.user?.id;
      if (error || !user) {
        setError(error);
        setLoading(false);
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error en el inicio de sesión");
    }
    setLoading(false);
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center overflow-hidden bg-blue-400">
      {/* Fondo animado con líneas diagonales */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 animate-gradientShift"></div>
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-1/2 bg-gradient-to-r from-blue-100/50 via-transparent to-blue-100/50 opacity-30"
              style={{
                top: `${i * 10}%`,
                transform: `rotate(-25deg) translateX(-100%)`,
                animation: `moveLines ${20 + i * 5}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes moveLines {
          0% { transform: rotate(-25deg) translateX(-100%); }
          50% { transform: rotate(-25deg) translateX(100%); }
          100% { transform: rotate(-25deg) translateX(-100%); }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradientShift {
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
        }
      `}</style>

      {/* Formulario */}
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-8 flex flex-col gap-3 z-10">
        <img alt="UNITEC" src="/logo.png" className="w-48 h-auto mx-auto" />
        <h1 className="text-blue-500 font-[Poppins] text-3xl font-extrabold text-center">
          INICIO DE SESIÓN
        </h1>
        <p className="text-center font-[Poppins] text-gray-700 font-medium">
          Ingrese su correo y contraseña
        </p>

        <Form className="flex-col flex" name="loginForm" layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label={<span className="text-5md font-bold font-[Poppins]">Correo electrónico</span>}
            name="email"
            rules={[
              { required: true, message: "Por favor ingrese su correo" },
              { type: "email", message: "Por favor ingrese un correo válido" },
            ]}
          >
            <Input className="font-[Poppins]" placeholder="Ejemplo@unitec.edu" />
          </Form.Item>

          <Form.Item
            label={<span className="text-5md font-bold font-[Poppins]">Contraseña</span>}
            name="password"
            rules={[{ required: true, message: "Por favor ingrese su contraseña" }]}
          >
            <Input.Password
              className="font-[Poppins]"
              placeholder="********"
              autoComplete="current-password"
            />
          </Form.Item>
          {error && (<p className="text-red-500 font-[Poppins] justify-center flex">Correo o contraseña incorrecta</p>)}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="mt-1 bg-blue-700 font-[Poppins] font-bold hover:scale-105 active:bg-blue-500 hover:bg-blue-500"
              block
            >
              Ingresar
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
