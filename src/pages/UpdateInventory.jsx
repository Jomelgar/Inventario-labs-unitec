import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Spin,
  message,
  Select,
} from "antd";
import { supabase } from "../supabaseClient";

export default function EditEquipment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const [laboratories, setLaboratories] = useState([]);

  const [equipmentRisk, setEquipmentRisk] = useState([]);
  const [equipmentState, setEquipmentState] = useState([]);
  const [equipmentInstalation, setEquipmentInstalation] = useState([]);
  const [maintenanceType, setMaintenanceType] = useState([]);
  const [maintenanceFrequency, setMaintenanceFrequency] = useState([]);
  const [maintenanceExecution, setMaintenanceExecution] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [panelState, setPanelState] = useState([]);
  const [protectionType, setProtectionType] = useState([]);

  const [loading, setLoading] = useState(true);

  /* =====================
     ENUMS
  ===================== */
  const fetchEnums = async () => {
    const loaders = [
      ["get_loan_types", setLoanType],
      ["get_panel_state", setPanelState],
      ["get_equipment_state", setEquipmentState],
      ["get_equipment_risk", setEquipmentRisk],
      ["get_equipment_installation", setEquipmentInstalation],
      ["get_maintenance_type", setMaintenanceType],
      ["get_maintenance_frequency", setMaintenanceFrequency],
      ["get_maintenance_execution", setMaintenanceExecution],
      ["get_protection_type", setProtectionType],
    ];

    await Promise.all(
      loaders.map(async ([rpc, setter]) => {
        const { data, error } = await supabase.rpc(rpc);
        if (error) message.error(error.message);
        else setter(data);
      })
    );
  };

  /* =====================
     LABS
  ===================== */
  const fetchLaboratories = async () => {
    const { data, error } = await supabase
      .from("laboratories")
      .select("id, name, location")
      .order("created_at", { ascending: false });

    if (error) message.error(error.message);
    else setLaboratories(data);
  };

  /* =====================
     LOAD EQUIPMENT
  ===================== */
  const fetchEquipment = async () => {
    const { data, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      message.error(error.message);
      navigate("/inventories");
      return;
    }

    form.setFieldsValue({
      ...data,
    });
  };

  /* =====================
     INIT
  ===================== */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchEnums(),
        fetchLaboratories(),
        fetchEquipment(),
      ]);
      setLoading(false);
    };

    load();
  }, [id]);

  /* =====================
     SUBMIT
  ===================== */
  const onFinish = async (values) => {
    const { error } = await supabase
      .from("equipment")
      .update({
        ...values,
        last_update: new Date(),
      })
      .eq("id", id);

    if (error) return message.error(error.message);

    message.success("Equipo actualizado correctamente");
    navigate("/inventories");
  };

  /* =====================
     LOADING
  ===================== */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spin size="large" tip="Cargando equipo..." />
      </div>
    );
  }

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="flex flex-col gap-4 w-full h-full p-4 mx-auto">
      <Card className="shadow-md">
        <h1 className="text-xl md:text-2xl font-semibold text-blue-700 mb-4">
          Editar Equipo
        </h1>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Laboratorio" name="id_lab" rules={[{ required: true }]}>
              <Select placeholder="Selecciona laboratorio">
                {laboratories.map((lab) => (
                  <Select.Option key={lab.id} value={lab.id}>
                    {lab.name} - {lab.location}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Nombre del equipo" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Marca" name="brand">
              <Input />
            </Form.Item>

            <Form.Item label="Modelo" name="model">
              <Input />
            </Form.Item>

            <Form.Item label="Número de Serie del Equipo" name="model_series">
              <Input />
            </Form.Item>

            <Form.Item label="Número de Viñeta / Servicios Generales" name="panel_series">
              <Input />
            </Form.Item>

            <Form.Item label="Estado del equipo" name="equipment_state">
              <Select loading={!equipmentState.length}>
                {equipmentState.map((v) => (
                  <Select.Option key={v} value={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Riesgo del equipo" name="equipment_risk">
              <Select loading={!equipmentRisk.length}>
                {equipmentRisk.map((v) => (
                  <Select.Option key={v} value={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tipo de instalación" name="equipment_instalation">
              <Select loading={!equipmentInstalation.length}>
                {equipmentInstalation.map((v) => (
                  <Select.Option key={v} value={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tipo de préstamo" name="loan_type">
              <Select loading={!loanType.length}>
                {loanType.map((v) => (
                  <Select.Option key={v} value={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Estado de viñeta" name="panel_state">
              <Select loading={!panelState.length}>
                {panelState.map((v) => (
                  <Select.Option key={v} value={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tipo de mantenimiento" name="maintenance_type">
              <Select loading={!maintenanceType.length}>
                {maintenanceType.map((v) => (
                  <Select.Option key={v} value={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Frecuencia de mantenimiento" name="maintenance_frequency">
              <Select loading={!maintenanceFrequency.length}>
                {maintenanceFrequency.map((v) => (
                  <Select.Option key={v} value={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Ejecución de mantenimiento" name="maintenance_execution">
              <Select loading={!maintenanceExecution.length}>
                {maintenanceExecution.map((v) => (
                  <Select.Option key={v} value={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tipo de protección" name="protection_type">
              <Select loading={!protectionType.length}>
                {protectionType.map((v) => (
                  <Select.Option key={v} value={v}>{v}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button type="primary" htmlType="submit" block>
              Guardar cambios
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
