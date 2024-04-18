import React, { useContext } from "react";
import { UserContext } from "../UserContext";
import { Navigate } from "react-router-dom";

const IndexPage = () => {
	const { username } = useContext(UserContext);

	if (!username) {
		return <Navigate to="/login" />;
	}

	return <Navigate to="/chat" />;
};

export default IndexPage;
