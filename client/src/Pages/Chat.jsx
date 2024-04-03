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
    }, [username])

    if (!username) {
        return <Login />;
    }

    return (
        <div className="flex h-screen">
            <div className="bg-blue-50 w-1/3">
                contact
            </div>
            <div className="flex flex-col bg-blue-100 w-2/3 p-2">
                <div className="flex-grow">
                    messages with selected person
                </div>
                <div className="flex gap-2 ">
                    <input type="text"
                        placeholder="Type your message here"
                        className="bg-white flex-grow border rounded-sm p-2"/>
                    <button className="bg-blue-500 p-2 mb-2 text-white rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>

                    </button>
                </div>
            </div>
            {/* <button onClick={logout}>Logout</button> */}
        </div>
    );
};

export default Chat;
