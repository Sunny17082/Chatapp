import React, { useContext } from "react";
import { UserContext } from "../UserContext";
import Login from "./Login";

const Chat = () => {
    const { username, id } = useContext(UserContext);

    if (!username) {
        return <Login />;
    }

    return (
        <div>
            Logged in {username}
        </div>
    );
};

export default Chat;
