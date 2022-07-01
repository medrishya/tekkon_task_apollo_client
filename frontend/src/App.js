import logo from "./logo.svg";
import "./App.css";

import { Button } from "antd";
import { LoginForm, RegisterForm, SendMessageForm } from "./forms";
import Messages from "./ui/Messages";
import ApolloProvider from "./ApolloProvider";
import { useEffect, useState } from "react";
import LogOutForm from "./forms/LogOutForm";

function App() {
  const [logged_in, set_logged_in] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      set_logged_in(true);
    }
  }, [localStorage.getItem("token")]);
  return (
    <ApolloProvider>
      <div className="App">
        {logged_in ? (
          <div>
            <LogOutForm set_logged_in={set_logged_in} />
            <Messages />
            <SendMessageForm />
          </div>
        ) : (
          <>
            <RegisterForm />
            <LoginForm set_logged_in={set_logged_in} />
          </>
        )}
      </div>
    </ApolloProvider>
  );
}

export default App;
