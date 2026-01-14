import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AnimatedLinesBackground from "../components/AnimatedLinesBackground";
import { Layout, Menu, Drawer, Button } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  AppstoreOutlined,
  PlusSquareOutlined,
  HomeOutlined,
  LogoutOutlined,
  LaptopOutlined,
} from "@ant-design/icons";
import { supabase } from "../supabaseClient";

const { Sider, Content, Header } = Layout;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedKey = (() => {
    switch (location.pathname) {
      case "/dashboard":
        return "0";
      case "/users":
        return "1";
      case "/inventories":
        return "2";
      case "/inventories/new":
        return "2";
      case "/laboratories":
        return "3";
      case "/profile":
        return "1";
      default:
        if (location.pathname.startsWith("/profile/")) return "1"; 
        if (location.pathname.startsWith("/inventories/")) return "2"; 
        return "0";
    }
  })();

  const MenuContent = (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[selectedKey]}
      className="bg-transparent font-[Poppins]"
    >
      <Menu.Item
        key="0"
        icon={<HomeOutlined />}
        onClick={() => {
          navigate("/dashboard");
          setDrawerOpen(false);
        }}
      >
        Inicio
      </Menu.Item>

      <Menu.Item
        key="1"
        icon={<UserOutlined />}
        onClick={() => {
          navigate("/users");
          setDrawerOpen(false);
        }}
      >
        Usuarios
      </Menu.Item>

      <Menu.Item
        key="2"
        icon={<AppstoreOutlined />}
        onClick={() => {
          navigate("/inventories");
          setDrawerOpen(false);
        }}
      >
        Inventario
      </Menu.Item>

      <Menu.Item
        key="3"
        icon={<LaptopOutlined />}
        onClick={() => {
          navigate("/laboratories");
          setDrawerOpen(false);
        }}
      >
        Laboratorios
      </Menu.Item>
      <Menu.Item
        key="-1"
        icon={<LogoutOutlined />}
        onClick={async() => {
          await supabase.auth.signOut();
          navigate("/login");
          setDrawerOpen(false);
        }}
      >
        Cerrar Sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen">
      {/* SIDEBAR DESKTOP */}
      {!isMobile && (
        <Sider
          width={260}
          className="relative overflow-hidden"
          style={{ background: "transparent" }}
        >
          <AnimatedLinesBackground className="absolute inset-0 opacity-20" />

          <div className="flex flex-col items-center gap-4 relative z-10 text-center py-6">
            <img src="/UT2.png" alt="UNITEC" className="w-8"/>
            <h1 className="text-2xl font-bold text-white">Inventario</h1>
            <div className="border-b border-white/30 mx-6 my-4" />
          </div>

          <div className="relative z-10">{MenuContent}</div>
        </Sider>
      )}

      {/* CONTENIDO */}
      <Layout>
        {/* HEADER MÓVIL */}
        {isMobile && (
          <Header className="flex items-center bg-white shadow-md px-4">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              className="text-xl"
            />
            <h2 className="ml-3 font-semibold text-gray-700">
              Panel de Control
            </h2>
          </Header>
        )}

        <Content className="p-4 md:p-6 bg-gray-100 overflow-y-auto">
          <Outlet />
        </Content>
      </Layout>

      {/* DRAWER MÓVIL */}
      <Drawer
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        bodyStyle={{ padding: 0 }}
        width={260}
      >
        <div className="relative h-full overflow-hidden bg-gradient-to-b from-indigo-900 to-indigo-600">
          <AnimatedLinesBackground className="absolute inset-0 opacity-20" />

          <div className="flex flex-col items-center gap-4 relative z-10 text-center py-6">
            <img src="/UT2.png" alt="UNITEC" className="w-8"/>
            <h1 className="text-2xl font-bold text-white">Inventario</h1>
            <div className="border-b border-white/30 mx-6 my-4" />
          </div>

          <div className="relative z-10">{MenuContent}</div>
        </div>
      </Drawer>
    </Layout>
  );
}
