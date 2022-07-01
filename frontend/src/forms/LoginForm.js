import { Button, Form, Input, Typography } from "antd";
import { gql, useLazyQuery } from "@apollo/client";

const { Title } = Typography;
const LOGIN_USER = gql`
  query login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      username
      token
      createdAt
    }
  }
`;

export const LoginForm = ({ set_logged_in }) => {
  const [loginuser, { loading }] = useLazyQuery(LOGIN_USER, {
    onCompleted(data) {
      localStorage.setItem("token", data.login.token);
      set_logged_in(true);
      window.location.reload();
    },
    onError(err) {
      console.log(err);
    },
  });
  const onFinish = (values) => {
    console.log("Success:", values);
    loginuser({ variables: values });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Title level={1}>Login</Title>
      <Form
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
          name={"username"}
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
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
