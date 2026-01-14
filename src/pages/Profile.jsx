import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Form, Input, Checkbox, Button, Card, Spin, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { supabase, createUser, changePassword } from "../supabaseClient";
import AnimatedLinesBackground from "../components/AnimatedLinesBackground";

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const isEdit = Boolean(id);

  const [laboratories, setLaboratories] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [selectedUuid, setSelectedUuid] = useState("");
  const [userLabs, setUserLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUser, setIsUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchLaboratories = async () => {
    const { data, error } = await supabase
      .from("laboratories")
      .select("id, name, location")
      .order("created_at", { ascending: false });

    if (!error) {
      setLaboratories(data);
      setFilteredLabs(data);
    }
  };

  const fetchUser = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, uuid, email, fullname, isAdmin")
      .eq("id", userId)
      .single();

    if (!error && data) {
      form.setFieldsValue(data);
    }

    const user = await supabase.auth.getUser();
    const uuid = user.data.user.id;
    setSelectedUuid(data.uuid);
    setIsUser(uuid === data.uuid);
  };

  const fetchUserLabs = async (userId) => {
    const { data, error } = await supabase
      .from("users_labs")
      .select("lab_id")
      .eq("user_id", userId);

    if (!error) {
      setUserLabs(data.map((ul) => ul.lab_id));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const user = await supabase.auth.getUser();
      const uuid = user.data.user.id;

      const { data: adminData, error: adminError } = await supabase
        .from("users")
        .select("isAdmin, uuid")
        .eq("uuid", uuid)
        .single();

      if (adminError || (!adminData?.isAdmin && uuid !== adminData?.uuid)) {
        navigate("/dashboard");
        return;
      }

      setIsAdmin(adminData?.isAdmin);

      await fetchLaboratories();
      if (isEdit) {
        await fetchUser(id);
        await fetchUserLabs(id);
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  const onSearchLab = (value) => {
    setFilteredLabs(
      laboratories.filter((lab) =>
        lab.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };


  const onFinishLabs = async (id) => {
    // Actualizar laboratorios del usuario
      const { error: delError } = await supabase.from("users_labs").delete().eq("user_id", id);
      if (delError) return message.error(delError.message);

      if (userLabs.length > 0) {
        const insertData = userLabs.map((lab_id) => ({
          user_id: id,
          lab_id,
        }));
        const { error: insertError } = await supabase.from("users_labs").insert(insertData);
        if (insertError) return message.error(insertError.message);
      }

      message.success("Usuario actualizado correctamente");
  };

  const onFinish = async (values) => {
    if (isEdit) {
      const {password, ...data}= values;
      const { error } = await supabase.from("users").update(data).eq("id", id);
      if (error) return message.error(error.message);
      if (password) {
        try {
          await changePassword(selectedUuid, password);
        } catch (err) {
          return message.error(err.message);
        }
      }
      await onFinishLabs(id);
      if(password) navigate("/login");
      else navigate(-1);
    } else {
      const uuid = await createUser(values.email, values.password);
      const { data,error } = await supabase
        .from("users")
        .insert({
          uuid: uuid,
          email: values.email,
          fullname: values.fullname,
          isAdmin: values.isAdmin,
        }).select().single();
      if (error) return message.error(error.message);

      await onFinishLabs(data.id);
      message.success("Usuario creado correctamente");
      navigate(-1);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;

  return (
    <div className="flex gap-4 w-full h-full p-4">
      {/* PANEL IZQUIERDO */}
      <Card className="flex-1 shadow">
        <h1 className="text-2xl font-semibold text-blue-700 mb-6">
          {isEdit ? "Editar Usuario" : "Crear Usuario"}
        </h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            email: "",
            fullname: "",
            isAdmin: false,
          }}
        >
          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input disabled={isEdit} />
          </Form.Item>

          <Form.Item
            label="Nombre completo"
            name="fullname"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          {!isEdit ? (
            <Form.Item
              label="Contraseña"
              name="password"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
            )
          : (
            <Form.Item
              label="Nueva Contraseña"
              name="password"
              rules={[{ min: 6 }]}
            >
              <Input.Password placeholder="Dejar en blanco para no cambiar" />
            </Form.Item>
            )
          }

          <Form.Item name="isAdmin" valuePropName="checked">
            <Checkbox disabled={isUser}>Administrador</Checkbox>
          </Form.Item>

          <div className="flex gap-3">
            <Button type="primary" htmlType="submit">
              {isEdit ? "Actualizar" : "Crear"}
            </Button>
            <Button onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </Form>
      </Card>

      {/* PANEL DERECHO */}
      <div className="w-[24%] relative overflow-hidden rounded-xl shadow">
        <AnimatedLinesBackground />

        <div className="relative z-10 h-full flex flex-col p-4 text-white">
          <h2 className="text-lg font-semibold mb-3">Permisos de Laboratorios</h2>

          <Input
            placeholder="Buscar laboratorio..."
            prefix={<SearchOutlined />}
            onChange={(e) => onSearchLab(e.target.value)}
            className="mb-3"
          />

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredLabs.map((lab) => (
              <Card
                key={lab.id}
                className="bg-white/90 shadow flex items-center justify-between"
                size="small"
              >
                <div>
                  <p className="font-medium">{lab.name}</p>
                  <p className="text-xs text-gray-500">{lab.location}</p>
                </div>
                <Checkbox
                  checked={userLabs.includes(lab.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      setUserLabs((prev) => [...prev, lab.id]);
                    } else {
                      setUserLabs((prev) => prev.filter((id) => id !== lab.id));
                    }
                  }}
                  disabled={!isAdmin} // Solo admin puede modificar
                />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
