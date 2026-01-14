import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Select,
  Row,
  Col,
  Tag,
  Avatar,
  Tooltip,
  Spin,
  Alert,
  Input,
  Button,
  Modal,
  message,
} from "antd";
import {
  UserOutlined,
  CrownOutlined,
  MailOutlined,
  CalendarOutlined,
  TableOutlined,
  AppstoreOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { deleteUser, supabase } from "../supabaseClient";

export default function UsersView() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [gridView, setGridView] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =====================
  // CARGAR USUARIOS
  // =====================
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, uuid, fullname, email, isAdmin, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setUsers(data);
        setFilteredUsers(data);
      }

      setLoading(false);
    };

    fetchUsers();
  }, []);

  // =====================
  // FILTRADO
  // =====================
  useEffect(() => {
    let temp = [...users];

    if (roleFilter !== "all") {
      temp = temp.filter((u) =>
        roleFilter === "admin" ? u.isAdmin : !u.isAdmin
      );
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(
        (u) =>
          u.fullname.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(temp);
  }, [roleFilter, searchTerm, users]);

  // =====================
  // ELIMINAR USUARIO
  // =====================
  const handleDeleteUser = (userId, fullname) => {
    Modal.confirm({
      title: `Eliminar usuario "${fullname}"`,
      content: "¿Estás seguro de que quieres eliminar este usuario?",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        const { data,error } = await supabase.from("users").delete().eq("id", userId).select().single();
        if (error) {
          message.error("Error al eliminar: " + error.message);
        } else {
          await deleteUser(data.uuid);
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          message.success("Usuario eliminado correctamente");
        }
      },
    });
  };

  // =====================
  // COLUMNAS TABLA
  // =====================
  const columns = [
    { title: "Nombre", dataIndex: "fullname", key: "fullname", width: "25%" },
    { title: "Email", dataIndex: "email", key: "email", width: "30%" },
    {
      title: "Rol",
      dataIndex: "isAdmin",
      key: "isAdmin",
      width: "15%",
      render: (isAdmin) =>
        isAdmin ? (
          <Tag color="gold" icon={<CrownOutlined />}>
            Admin
          </Tag>
        ) : (
          <Tag color="blue">Usuario</Tag>
        ),
    },
    {
      title: "Creado",
      dataIndex: "created_at",
      key: "created_at",
      width: "15%",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Acciones",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/profile/${record.id}`)}
          >
            Editar
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteUser(record.id, record.fullname)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  // =====================
  // LOADING / ERROR
  // =====================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message="Error" description={error} />;
  }

  // =====================
  // RENDER
  // =====================
  return (
    <>
      <h1 className="text-2xl font-bold text-blue-800 mb-4 font-[Poppins]">
        Gestión de Usuarios
      </h1>

      <div className="flex flex-col sm:flex-row justify-left items-start mb-4 gap-2 bg-white p-4 rounded-lg border border-gray-300">
        <Input.Search
          placeholder="Buscar por nombre o email"
          allowClear
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 220 }}
        />
        <Select
          size="middle"
          value={roleFilter}
          onChange={setRoleFilter}
          style={{ width: 140 }}
          options={[
            { value: "all", label: "Todos" },
            { value: "admin", label: "Admin" },
            { value: "user", label: "Usuario" },
          ]}
        />
        <Select
          size="middle"
          value={gridView ? "cards" : "table"}
          onChange={(value) => setGridView(value === "cards")}
          style={{ width: 140 }}
          options={[
            {
              value: "table",
              label: (
                <span className="flex items-center gap-2">
                  <TableOutlined /> Tabla
                </span>
              ),
            },
            {
              value: "cards",
              label: (
                <span className="flex items-center gap-2">
                  <AppstoreOutlined /> Tarjetas
                </span>
              ),
            },
          ]}
        />
        <Button
          icon={<PlusCircleOutlined />}
          type="primary"
          className="ml-auto"
          onClick={() => navigate("/profile")}
        >
          Crear Usuario
        </Button>
      </div>

      {!gridView && (
        <Table
          className="overflow-x-auto bg-white "
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      )}

      {gridView && (
        <Row gutter={[16, 16]}>
          {filteredUsers.map((user) => (
            <Col xs={32} sm={18} md={14} lg={10} key={user.id}>
              <Card
                hoverable
                className="overflow-x-auto w-full"
                actions={[
                  <Tooltip title={user.email} key="email">
                    <MailOutlined />
                  </Tooltip>,
                  <Tooltip
                    title={new Date(user.created_at).toLocaleDateString()}
                    key="date"
                  >
                    <CalendarOutlined />
                  </Tooltip>,
                  <Tooltip title="Editar Usuario" key="edit">
                    <EditOutlined
                      onClick={() => navigate(`/profile/${user.id}`)}
                    />
                  </Tooltip>,
                  <Tooltip title="Eliminar Usuario" key="delete">
                    <DeleteOutlined
                      className="!text-red-500 hover:!text-red-400"
                      onClick={() => handleDeleteUser(user.id, user.fullname)}
                    />
                  </Tooltip>,
                ]}
              >
                <Card.Meta
                  avatar={
                    <Avatar
                      size="large"
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: user.isAdmin ? "#fadb14" : "#1677ff",
                      }}
                    />
                  }
                  title={
                    <div className="flex flex-wrap items-center gap-2 break-words text-sm w-full font-[Poppins]">
                      {user.fullname}
                      {user.isAdmin && <CrownOutlined className="text-yellow-400" />}
                    </div>
                  }
                  description={
                    <>
                      <div className="mb-1 text-sm">
                        <MailOutlined /> {user.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        Creado: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}
