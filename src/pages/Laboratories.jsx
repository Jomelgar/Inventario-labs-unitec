import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Select,
  Row,
  Col,
  Tooltip,
  Spin,
  Alert,
  Input,
  Button,
  Modal,
  message,
} from "antd";
import {
  TableOutlined,
  AppstoreOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "../supabaseClient";
import CreateLabModal from "../modals/Lab";

export default function LabsView() {
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [labView, setLabView] = useState(null); // id del lab o -1 para crear
  const [modalVisible, setModalVisible] = useState(false);
  const [gridView, setGridView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  // Cargar usuario y laboratorios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No hay usuario logueado");

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("isAdmin")
          .eq("uuid", user.id)
          .single();

        if (userError) throw userError;
        setIsAdmin(userData.isAdmin);

        const { data, error } = await supabase
          .from("laboratories")
          .select("id, name, location, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLabs(data);
        setFilteredLabs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado
  useEffect(() => {
    setFilteredLabs(
      labs.filter(
        (l) =>
          l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, labs]);

  // Función eliminar laboratorio
  const handleDeleteLab = (labId, labName) => {
    Modal.confirm({
      title: `Eliminar laboratorio "${labName}"`,
      content: "¿Estás seguro de que quieres eliminar este laboratorio?",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        const { error } = await supabase.from("laboratories").delete().eq("id", labId);
        if (error) {
          message.error("Error al eliminar: " + error.message);
        } else {
          setLabs((prev) => prev.filter((l) => l.id !== labId));
          message.success("Laboratorio eliminado correctamente");
        }
      },
    });
  };

  // Columnas tabla
  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name", width: "35%" },
    { title: "Ubicación", dataIndex: "location", key: "location", width: "35%" },
    {
      title: "Creado",
      dataIndex: "created_at",
      key: "created_at",
      width: "15%",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    ...(isAdmin
      ? [
          {
            title: "Acciones",
            key: "actions",
            width: "15%",
            render: (_, record) => (
              <div className="flex gap-2">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setLabView(record.id);
                    setModalVisible(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDeleteLab(record.id, record.name)}
                >
                  Eliminar
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  if (loading)
    return <Spin size="large" className="flex justify-center items-center h-64" />;
  if (error) return <Alert type="error" message="Error" description={error} />;

  return (
    <>
      <h1 className="text-2xl font-bold text-blue-800 mb-4">Gestión de Laboratorios</h1>

      {/* Filtros y vista */}
      <div className="flex flex-col sm:flex-row justify-left items-start mb-4 gap-2 bg-white p-4 rounded-lg border border-gray-300">
        <Input.Search
          placeholder="Buscar por nombre o ubicación"
          allowClear
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 220 }}
        />

        <Select
          size="middle"
          value={gridView ? "cards" : "table"}
          onChange={(value) => setGridView(value === "cards")}
          style={{ width: 140 }}
          options={[
            { value: "table", label: <span className="flex items-center gap-2"><TableOutlined /> Tabla</span> },
            { value: "cards", label: <span className="flex items-center gap-2"><AppstoreOutlined /> Tarjetas</span> },
          ]}
        />

        {isAdmin && (
          <Button
            icon={<PlusCircleOutlined />}
            type="primary"
            className="ml-auto"
            onClick={() => {
              setLabView(-1);
              setModalVisible(true);
            }}
          >
            Crear Laboratorio
          </Button>
        )}
      </div>

      {/* Tabla */}
      {!gridView && (
        <Table
          columns={columns}
          dataSource={filteredLabs}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          className="bg-white overflow-x-auto"
        />
      )}

      {/* Tarjetas */}
      {gridView && (
        <Row gutter={[16, 16]}>
          {filteredLabs.map((lab) => (
            <Col xs={32} sm={18} md={14} lg={10} key={lab.id}>
              <Card
                hoverable
                className="overflow-x-auto w-full"
                actions={
                  isAdmin
                    ? [
                        <Tooltip title="Editar Laboratorio" key="edit">
                          <EditOutlined
                            onClick={() => {
                              setLabView(lab.id);
                              setModalVisible(true);
                            }}
                          />
                        </Tooltip>,
                        <Tooltip title="Eliminar Laboratorio" key="delete">
                          <DeleteOutlined
                            className="!text-red-500 hover:!text-red-400"
                            onClick={() => handleDeleteLab(lab.id, lab.name)}
                          />
                        </Tooltip>,
                      ]
                    : []
                }
              >
                <Card.Meta
                  title={lab.name}
                  description={
                    <>
                      <div className="text-sm">Ubicación: {lab.location}</div>
                      <div className="text-xs text-gray-500">
                        Creado: {new Date(lab.created_at).toLocaleDateString()}
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal Crear/Editar */}
      {isAdmin && (
        <CreateLabModal
          labId={labView}
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreatedOrUpdated={(lab) => {
            setLabs((prev) => {
              const exists = prev.find((l) => l.id === lab.id);
              if (exists) return prev.map((l2) => (l2.id === lab.id ? lab : l2));
              return [lab, ...prev];
            });
          }}
        />
      )}
    </>
  );
}
