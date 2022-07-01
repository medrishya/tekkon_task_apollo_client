import { gql, useSubscription, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button } from "antd";

const USER_LOGOUT = gql`
  mutation userLogOut {
    userLogOut {
      username
    }
  }
`;

export default function Home({ set_logged_in }) {
  const [userLogout] = useMutation(USER_LOGOUT);
  const logoutTheUser = async () => {
    console.log("okay");
    await userLogout({
      variables: { now: new Date().toISOString() },
    });
    localStorage.removeItem("token");
    set_logged_in(false);
  };

  return (
    <div>
      <div>
        <Button
          type="danger"
          onClick={() => {
            logoutTheUser();
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
