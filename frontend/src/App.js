import logo from "./logo.svg";
import "./App.css";

import { Button } from "antd";
import { LoginForm, RegisterForm } from "./forms";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from "@apollo/client";
import { useEffect, useState } from "react";
const client = new ApolloClient({
  uri: "http://localhost:4000/",
  cache: new InMemoryCache(),
});

function App() {
  const [logged_in, set_logged_in] = useState(false);
  // if (localStorage.getItem("token")) {
  //   set_logged_in(true);
  // }
  useEffect(() => {
    if (localStorage.getItem("token")) {
      set_logged_in(true);
    }
  }, [localStorage.getItem("token")]);
  return (
    <ApolloProvider client={client}>
      <div className="App">
        {logged_in ? (
          <div>"Logged in"</div>
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
