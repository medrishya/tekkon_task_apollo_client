import { Button, Form, Input, Typography, notification } from "antd";
import { gql, useMutation } from "@apollo/client";

const { Title } = Typography;

const REGISTER_USER = gql`
  mutation register($username: String!, $password: String!) {
    register(username: $username, password: $password) {
      username

      createdAt
    }
  }
`;
const openNotification = (message) => {
  notification.open({
    message: "User Registration",
    description: message,
    onClick: () => {
      console.log("Notification Clicked!");
    },
  });
};
export const RegisterForm = () => {
  const [form] = Form.useForm();
  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    update(_, res) {
      openNotification("User registration successfull");
      form.resetFields();
    },
    onError(err) {
      openNotification("User registration failed, please use another username");
    },
  });
  const onFinish = (values) => {
    registerUser({ variables: values });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Title level={1}>Register User</Title>
      <Form
        form={form}
        name="basic"
        wrapperCol={{
          offset: 8,
          span: 8,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 10,
            span: 5,
          }}
        >
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
