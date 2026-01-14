import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Card,
  Row,
  Col,
  Input,
  Select,
  Spin,
  Alert,
  Tooltip,
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
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { supabase } from "../supabaseClient";

const { confirm } = Modal;

export default function EquipmentView() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(0);
  const [editableLabs, setEditableLabs] = useState([]);
  const [gridView, setGridView] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchLabs = async () => {
    const { data, error } = await supabase
      .from("laboratories")
      .select("id, name")
      .order("name");

    if (error) throw error;
    setLabs([{ id: 0, name: "Todos" }, ...data]);

    await fetchEditableLabs();
  };

  const fetchEditableLabs = async () => {
    const { data,error } = await supabase.auth.getUser();
    
    const uuid = data.user.id;
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("uuid", uuid)
        .single();
    
    if (!profileData) return;

    if(profileData.isAdmin){
      const { data, error } = await supabase
      .from("laboratories")
      .select("id, name")
      .order("name");

      if (error) throw error;
      setEditableLabs(data.map((l) => l.id));
      return;
    }
    const { data: labsData, error: labsError } = await supabase
      .from("users_labs")
      .select("lab_id")
      .eq("user_id", profileData.id);

    if (labsError) throw labsError;
    
    setEditableLabs(labsData.map((l) => l.lab_id));
  }
  const fetchEquipment = async (labId = null) => {
    let query = supabase
      .from("equipment")
      .select("id, name, brand, model, equipment_state, last_update, id_lab(id, name)")
      .order("last_update", { ascending: false })
      .limit(100);

    if (labId && labId !== 0) {
      query = query.eq("id_lab", labId);
    }

    const { data, error } = await query;
    if (error) throw error;

    setEquipment(data);
    setFiltered(data);
  };

  useEffect(() => {
    fetchLabs();
    fetchEquipment()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(
      equipment.filter(
        (e) =>
          e.name?.toLowerCase().includes(search.toLowerCase()) ||
          e.brand?.toLowerCase().includes(search.toLowerCase()) ||
          e.model?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, equipment]);

  // 🗑️ ELIMINAR EQUIPO
  const handleDelete = (record) => {
    confirm({
      title: "¿Eliminar equipo?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          <p>
            ¿Estás seguro de eliminar el equipo <b>{record.name}</b>?
          </p>
          <p className="text-red-500">Esta acción no se puede deshacer.</p>
        </>
      ),
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      confirmLoading: deleting,
      async onOk() {
        try {
          setDeleting(true);

          const { error } = await supabase
            .from("equipment")
            .delete()
            .eq("id", record.id);

          if (error) throw error;

          message.success("Equipo eliminado correctamente");
          await fetchEquipment(selectedLab);
        } catch (err) {
          message.error(err.message);
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const columns = [
    { title: "Laboratorio", dataIndex: ["id_lab", "name"], key: "lab" },
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "Marca", dataIndex: "brand", key: "brand" },
    { title: "Modelo", dataIndex: "model", key: "model" },
    { title: "Estado", dataIndex: "equipment_state", key: "equipment_state" },
    {
      title: "Última actualización",
      dataIndex: "last_update",
      render: (d) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Acciones",
      render: (_, record) => (
        <div className="flex gap-2">
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              disabled={!editableLabs.includes(record.id_lab.id)}
              onClick={() => navigate(`/inventories/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!editableLabs.includes(record.id_lab.id)}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  if (loading)
    return <Spin size="large" className="flex justify-center items-center h-64" />;

  if (error) return <Alert type="error" message="Error" description={error} />;

  return (
    <>
      <h1 className="text-2xl font-bold text-blue-800 mb-4">
        Inventario de Equipos
      </h1>

      <div className="flex flex-wrap gap-2 mb-4 bg-white p-4 rounded-lg border">
        <Select
          placeholder="Filtrar por laboratorio"
          style={{ width: 220 }}
          value={selectedLab}
          onChange={(labId) => {
            setSelectedLab(labId);
            setLoading(true);
            fetchEquipment(labId).finally(() => setLoading(false));
          }}
          options={labs.map((lab) => ({
            value: lab.id,
            label: lab.name,
          }))}
        />

        <Input.Search
          placeholder="Buscar por nombre, marca o modelo"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 260 }}
        />

        <Select
          value={gridView ? "cards" : "table"}
          onChange={(v) => setGridView(v === "cards")}
          style={{ width: 140 }}
          options={[
            { value: "table", label: "Tabla" },
            { value: "cards", label: "Tarjetas" },
          ]}
        />

        <Button
          icon={<PlusCircleOutlined />}
          type="primary"
          className="ml-auto"
          onClick={() => navigate("/inventories/new")}
        >
          Agregar Equipo
        </Button>
      </div>

      {!gridView && (
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      )}

      {gridView && (
        <Row gutter={[16, 16]}>
          {filtered.map((eq) => (
            <Col xs={24} sm={12} md={8} lg={6} key={eq.id}>
              <Card
                hoverable
                actions={[
                    <Button
                      icon={<EditOutlined />}
                      disabled={!editableLabs.includes(eq.id_lab.id)}
                      onClick={() => navigate(`/inventories/${eq.id}`)}
                    />,
                    <Button
                    danger
                      icon={<DeleteOutlined />}
                      disabled={!editableLabs.includes(eq.id_lab.id)}
                      onClick={() => handleDelete(eq)}
                    />
                ]}
              >
                <Card.Meta
                  title={eq.name}
                  description={
                    <>
                      <div>Laboratorio: {eq.id_lab.name}</div>
                      <div>Marca: {eq.brand}</div>
                      <div>Modelo: {eq.model}</div>
                      <div className="text-xs text-gray-500">
                        Estado: {eq.equipment_state}
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
