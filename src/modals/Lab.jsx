import { useEffect, useState } from "react";
import { Form, Input, Button, Spin, notification } from "antd";
import { supabase } from "../supabaseClient";

export default function ModalLab({ labId, visible, onClose, onCreatedOrUpdated }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLab = async () => {
      if (labId && labId !== -1 && visible) {
        setLoading(true);
        const { data, error } = await supabase
          .from("laboratories")
          .select("*")
          .eq("id", labId)
          .single();

        if (!error && data) {
          form.setFieldsValue({
            name: data.name,
            location: data.location,
          });
        } else if (error) {
          notification.error({
            message: "Error",
            description: "No se pudo cargar el laboratorio: " + error.message,
          });
        }
        setLoading(false);
      } else if (visible) {
        form.resetFields();
      }
    };

    fetchLab();
  }, [labId, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let data, error;
      if (labId === -1) {
        ({ data, error } = await supabase
          .from("laboratories")
          .insert([{ name: values.name, location: values.location }])
          .select()
          .single());
      } else {
        ({ data, error } = await supabase
          .from("laboratories")
          .update({ name: values.name, location: values.location })
          .eq("id", labId)
          .select()
          .single());
      }

      setLoading(false);

      if (error) {
        notification.error({
          message: "Error",
          description: error.message,
        });
      } else {
        notification.success({
          message: labId === -1 ? "Laboratorio creado" : "Laboratorio actualizado",
          description: `El laboratorio "${data.name}" se ha ${labId === -1 ? "creado" : "actualizado"} correctamente.`,
        });
        onCreatedOrUpdated(data);
        onClose();
      }
    } catch (err) {
      console.log("Error de validación:", err);
    }
  };

  if (!visible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{labId === -1 ? "Crear Laboratorio" : "Editar Laboratorio"}</h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Nombre"
              name="name"
              rules={[{ required: true, message: "Ingrese el nombre del laboratorio" }]}
            >
              <Input placeholder="Nombre del laboratorio" />
            </Form.Item>

            <Form.Item
              label="Ubicación"
              name="location"
              rules={[{ required: true, message: "Ingrese la ubicación" }]}
            >
              <Input placeholder="Ubicación del laboratorio" />
            </Form.Item>

            <div style={styles.buttons}>
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                {labId === -1 ? "Crear" : "Actualizar"}
              </Button>
              <Button onClick={onClose} style={{ marginLeft: 8 }}>
                Cancelar
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    width: 400,
    maxWidth: "90%",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 16,
  },
};
