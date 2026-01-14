import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Alert, Table, Statistic } from "antd";
import { supabase } from "../supabaseClient";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalEquipment, setTotalEquipment] = useState(0);
  const [equipmentByState, setEquipmentByState] = useState([]);
  const [equipmentByLab, setEquipmentByLab] = useState([]);
  const [recentEquipment, setRecentEquipment] = useState([]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 🔹 Total equipos
      const { count, error: countError } = await supabase
        .from("equipment")
        .select("*", { count: "exact", head: true });
      if (countError) throw countError;
      setTotalEquipment(count || 0);

      // 🔹 Todos los equipos para agrupar
      const { data: allEquipment, error: allError } = await supabase
        .from("equipment")
        .select("equipment_state, id_lab(id, name)");
      if (allError) throw allError;

      // 🔹 Agrupar por estado
      const stateMap = {};
      allEquipment.forEach((eq) => {
        const state = eq.equipment_state || "Sin estado";
        stateMap[state] = (stateMap[state] || 0) + 1;
      });
      setEquipmentByState(
        Object.entries(stateMap).map(([name, value]) => ({ name, value }))
      );

      // 🔹 Agrupar por laboratorio
      const labMap = {};
      allEquipment.forEach((eq) => {
        const labName = eq.id_lab?.name || "Sin laboratorio";
        labMap[labName] = (labMap[labName] || 0) + 1;
      });
      setEquipmentByLab(
        Object.entries(labMap).map(([name, value]) => ({ name, value }))
      );

      // 🔹 Últimos 5 equipos
      const { data: recentData, error: recentError } = await supabase
        .from("equipment")
        .select("id, name, brand, model, equipment_state, id_lab(id, name)")
        .order("last_update", { ascending: false })
        .limit(5);
      if (recentError) throw recentError;
      setRecentEquipment(recentData || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "Marca", dataIndex: "brand", key: "brand" },
    { title: "Modelo", dataIndex: "model", key: "model" },
    { title: "Estado", dataIndex: "equipment_state", key: "state" },
    { title: "Laboratorio", dataIndex: ["id_lab", "name"], key: "lab" },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );

  if (error)
    return <Alert type="error" message="Error" description={error} />;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Dashboard</h1>

      {/* 🔹 Estadísticas rápidas */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total de Equipos" value={totalEquipment} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Estados registrados" value={equipmentByState.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Laboratorios" value={equipmentByLab.length} />
          </Card>
        </Col>
      </Row>

      {/* 🔹 Gráficas */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Equipos por estado">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive
                  data={equipmentByState}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {equipmentByState.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Equipos por laboratorio">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={equipmentByLab}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 🔹 Tabla últimos 5 equipos */}
      <Card title="Últimos equipos agregados">
        <Table
          columns={columns}
          dataSource={recentEquipment}
          rowKey="id"
          pagination={false}
          className="bg-white overflow-x-auto"
        />
      </Card>
    </div>
  );
}
