import { gql, useSubscription, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Col, Typography, Row } from "antd";

const { Title } = Typography;
const OFFLINE_USERS = gql`
  subscription userLoggedOut {
    userLoggedOut {
      username
    }
  }
`;
const ONLINE_USERS = gql`
  subscription getOnlineUserList {
    getOnlineUserList {
      username
    }
  }
`;
const UPDATE_LASTSEEN_MUTATION = gql`
  mutation updateLastSeen {
    updateLastSeen {
      username
    }
  }
`;

const USER_MESSAGES = gql`
  subscription newMessage {
    newMessage {
      content
      from
      to
    }
  }
`;
export default function Home({ history }) {
  const [user_messages, set_user_messages] = useState([]);
  const [online_users, set_online_users] = useState([]);

  const { data: offlineData, error: offlineError } =
    useSubscription(OFFLINE_USERS);
  const [show, set_show] = useState(true);
  useEffect(() => {
    if (offlineError) console.log(offlineError);
    if (offlineData) {
      const offline =
        offlineData.userLoggedOut && offlineData.userLoggedOut.username;
      if (online_users.indexOf(offline) > -1) {
        let m = JSON.parse(JSON.stringify(online_users));
        m.splice(online_users.indexOf(offline), 1);
        set_online_users(m);
      }
    }
  }, [offlineError, offlineData]);

  
  const { data: userMessageData, error: userMessageError } =
    useSubscription(USER_MESSAGES);
  useEffect(() => {
    if (userMessageError) console.log(userMessageError);
    if (userMessageData) {
      console.log(userMessageData, " --- userMessageData ");
      const userMessage = userMessageData.newMessage;
      let q = JSON.parse(JSON.stringify(user_messages));
      q.push(userMessage);
      set_user_messages(q);
    }
  }, [userMessageError, userMessageData]);

  // FOR FETCHING ONLINE USER
  const { data: onlineData, error: onlineError } =
    useSubscription(ONLINE_USERS);

  useEffect(() => {
    const onFunc = async () => {
      set_show(false);
      if (onlineError) console.log(onlineError);
      if (onlineData) {
        let check = true;
        const online =
          onlineData.getOnlineUserList && onlineData.getOnlineUserList.username;

        let m = JSON.parse(JSON.stringify(online_users));
        if (m.indexOf(online) > -1) {
        } else {
          m.push(online);
          set_online_users(m);
        }
      }
      set_show(true);
    };
    onFunc();
  }, [onlineError, onlineData]);

  const [updateLastSeenMutation] = useMutation(UPDATE_LASTSEEN_MUTATION);
  const updateLastSeen = () => {
    // Use the apollo client to run a mutation to update the last_seen value
    updateLastSeenMutation({
      variables: { now: new Date().toISOString() },
    });
  };

  useEffect(() => {
    updateLastSeen();
    setInterval(() => updateLastSeen(), 20000);
  }, []);
  console.log(user_messages, " --user messages");
  return (
    <div>
      <Row>
        <Col span={12}>
          <Title level={1}> Online users</Title>
          {online_users && online_users.length && online_users.length > 0 ? (
            <div>
              {online_users.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          ) : (
            <div></div>
          )}
        </Col>
        <Col span={12}>
          <Title level={1}> New Messages</Title>
          {user_messages && user_messages.length && user_messages.length > 0 ? (
            <div>
              {user_messages.map((item, index) => (
                <p key={index}>
                  {item.content}{" "}
                  <span style={{ color: "#CCC" }}> by {item.from}</span>
                </p>
              ))}
            </div>
          ) : (
            <div></div>
          )}
        </Col>
      </Row>
    </div>
  );
}
