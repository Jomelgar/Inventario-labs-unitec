import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Form, Input, Checkbox, Button, Card, Spin, message, Select} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { supabase } from "../supabaseClient";
import AnimatedLinesBackground from "../components/AnimatedLinesBackground";

export default function CreateEquipment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const isEdit = Boolean(id);

  const [laboratories, setLaboratories] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [equipmentRisk,setEquipmentRisk] = useState([]);
  const [equipmentState,setEquipmentState] = useState([]);
  const [equipmentInstalation, setEquipmentInstalation] = useState([]);
  const [maintenanceType,setMaintenanceType] = useState([]);
  const [maintenanceFrequency,setMaintenanceFrequency] = useState([]);
  const [maintenanceExecution,setMaintenanceExecution] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [panelState, setPanelState] = useState([]);
  const [protectionType, setProtectionType] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnums = async () => {
    await supabase.rpc("get_loan_types").then(({ data, error }) => {
      if (error) return message.error(error.message);
      setLoanType(data);
    });

    await supabase.rpc("get_panel_state").then(({ data, error }) => {
      if (error) return message.error(error.message);
      setPanelState(data);
    });

    await supabase.rpc("get_equipment_state").then(({ data, error }) => {
      if (error) return message.error(error.message);
      setEquipmentState(data);
    });

    await supabase.rpc("get_equipment_risk").then(({ data, error }) => {
      if (error) return message.error(error.message);
      setEquipmentRisk(data);
    });

    await supabase.rpc("get_equipment_installation").then(({ data, error }) => {
      if (error) return message.error(error.message);
      setEquipmentInstalation(data);
    });

    await supabase.rpc("get_maintenance_type").then(({ data, error }) => {
      if (error) return message.error(error.message);
      setMaintenanceType(data);
    });

    await supabase.rpc("get_maintenance_frequency").then(({ data, error }) => {
      if (error) return message.error(error.message);
      setMaintenanceFrequency(data);
    });

    await supabase.rpc("get_maintenance_execution").then(({ data, error }) => {
      if (error) return message.error(error.message);
      setMaintenanceExecution(data);
    });

    await supabase.rpc("get_protection_type").then(({ data, error }) => {
      if (error) return message.error(error.message);
      setProtectionType(data);
    });

  };
  // 🔹 Cargar labs
  const fetchLaboratories = async () => {
    const { data, error } = await supabase
      .from("laboratories")
      .select("id, name, location")
      .order("created_at", { ascending: false });

    if (error) return message.error(error.message);

    setLaboratories(data);
    setFilteredLabs(data);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchLaboratories();
      fetchEnums();
      setLoading(false);
    };

    load();
  }, []);

  // 🔍 Buscar lab
  const onSearchLab = (value) => {
    setFilteredLabs(
      laboratories.filter((lab) =>
        lab.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // 💾 Guardar equipo
  const onFinish = async (values) => {
    const { data, error } = await supabase
      .from("equipment")
      .insert({
        ...values,
        last_update: new Date(),
      })
      .select()
      .single();

    if (error) return message.error(error.message);

    message.success("Equipo creado correctamente");
    navigate("/inventories");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-full p-4  mx-auto">
      {/* PANEL IZQUIERDO */}
      <Card className="flex-1 shadow-md">
        <h1 className="text-xl md:text-2xl font-semibold text-blue-700 mb-4">
          {isEdit ? "Editar Equipo" : "Crear Equipo"}
        </h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Laboratorio */}
          <Form.Item
            label="Laboratorio"
            name="id_lab"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Selecciona laboratorio"
            >
              {filteredLabs.map((lab) => (
                <Select.Option key={lab.id} value={lab.id}>
                  {lab.name} - {lab.location}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {/* Nombre */}
          <Form.Item
            label="Nombre del equipo"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          {/* Marca */}
          <Form.Item label="Marca" name="brand">
            <Input />
          </Form.Item>

          {/* Modelo */}
          <Form.Item label="Modelo" name="model">
            <Input />
          </Form.Item>
          {/* NO. del equipo */}
          <Form.Item label="Número de Serie del Equipo" name="model_series">
            <Input />
          </Form.Item>
          {/* NO. de Servicios Generales */}
          <Form.Item label="Número de Viñeta / Servicios Generales" name="panel_series">
            <Input />
          </Form.Item>
          {/* Estado del equipo */}
          <Form.Item label="Estado del equipo" name="equipment_state">
            <Select loading={!equipmentState.length} placeholder="Selecciona estado">
              {equipmentState.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
            
          {/* Riesgo del equipo */}
          <Form.Item label="Riesgo del equipo" name="equipment_risk">
            <Select loading={!equipmentRisk.length} placeholder="Selecciona riesgo">
              {equipmentRisk.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
            
          {/* Instalación */}
          <Form.Item label="Tipo de instalación" name="equipment_instalation">
            <Select
              loading={!equipmentInstalation.length}
              placeholder="Selecciona instalación"
            >
              {equipmentInstalation.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
            
          {/* Tipo de préstamo */}
          <Form.Item label="Tipo de préstamo" name="loan_type">
            <Select loading={!loanType.length} placeholder="Selecciona tipo">
              {loanType.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
            
          {/* Estado de viñeta */}
          <Form.Item label="Estado de viñeta" name="panel_state">
            <Select loading={!panelState.length} placeholder="Selecciona estado">
              {panelState.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
            
          {/* Tipo de mantenimiento */}
          <Form.Item label="Tipo de mantenimiento" name="maintenance_type">
            <Select
              loading={!maintenanceType.length}
              placeholder="Selecciona tipo"
            >
              {maintenanceType.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
            
          {/* Frecuencia de mantenimiento */}
          <Form.Item
            label="Frecuencia de mantenimiento"
            name="maintenance_frequency"
          >
            <Select
              loading={!maintenanceFrequency.length}
              placeholder="Selecciona frecuencia"
            >
              {maintenanceFrequency.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
            
          {/* Ejecución de mantenimiento */}
          <Form.Item
            label="Ejecución de mantenimiento"
            name="maintenance_execution"
          >
            <Select
              loading={!maintenanceExecution.length}
              placeholder="Selecciona ejecución"
            >
              {maintenanceExecution.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
            
          {/* Tipo de protección */}
          <Form.Item label="Tipo de protección" name="protection_type">
            <Select
              loading={!protectionType.length}
              placeholder="Selecciona protección"
            >
              {protectionType.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
        </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button type="primary" htmlType="submit" block>
              Guardar
            </Button>
            <Button onClick={() => navigate(-1)} block>
              Cancelar
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
