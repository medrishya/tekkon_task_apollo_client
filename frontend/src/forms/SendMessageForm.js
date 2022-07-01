import { Button, Form, Input, Typography, notification } from "antd";
import { gql, useMutation } from "@apollo/client";

const { Title } = Typography;

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      to
      content
      createdAt
    }
  }
`;
const openNotification = (message) => {
  notification.open({
    message: "Send Message",
    description: message,
    onClick: () => {
      console.log("Notification Clicked!");
    },
  });
};
export const SendMessageForm = () => {
  const [form] = Form.useForm();
  const [registerUser, { loading }] = useMutation(SEND_MESSAGE, {
    update(_, res) {
      console.log(res);
      openNotification("Message sent successfully successfull");
      form.resetFields();
    },
    onError(err) {
      console.log(err);
      openNotification("Message sent failure");
    },
  });
  const onFinish = (values) => {
    console.log("Success:", values);
    registerUser({ variables: values });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Title level={1}>Send Message</Title>
      <Form
        name="basic"
        // labelCol={{
        //   span: 8,
        // }}
        wrapperCol={{
          offset: 8,
          span: 8,
        }}
        initialValues={{
          remember: true,
        }}
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          name="to"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input placeholder="Please enter username" />
        </Form.Item>
        <Form.Item
          name="content"
          rules={[
            {
              required: true,
              message: "Please input your message!",
            },
          ]}
        >
          <Input placeholder="Please enter your message" />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 10,
            span: 5,
          }}
        >
          <Button type="primary" htmlType="submit">
            Send Message
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
