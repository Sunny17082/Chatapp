import React, { useContext, useEffect } from "react";
import { UserContext } from "../UserContext";
import Login from "./Login";
import axios from "axios";

const Chat = () => {
    const { username, id, setUsername } = useContext(UserContext);

    const getUser = async () => {
        try {
            const { data } = await axios.get("/login/success");
            setUsername(data.username);
        } catch (err) {
            console.log(err);
        }
    }

    function logout() {
        window.open("http://localhost:5000/logout", "_self");
    }

    useEffect(() => {
        getUser();
    }, [])

    if (!username) {
        return <Login />;
    }

    return (
        <div>
            <div>Logged in {username}</div>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default Chat;
