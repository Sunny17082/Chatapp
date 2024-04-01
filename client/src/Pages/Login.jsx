import React, { useState } from "react";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
    return (
		<div className="bg-blue-50 w-full h-screen flex items-center justify-center">
			<form className="max-w-md mx-auto mb-64">
				<h1 className="text-4xl font-semibold mb-6 text-center">
					Login
				</h1>
				<input
					type="email"
					placeholder="email"
					value={email}
					onChange={(ev) => setEmail(ev.target.value)}
				/>
				<input
					type="password"
					placeholder="password"
					value={password}
					onChange={(ev) => setPassword(ev.target.value)}
				/>
				<button className="bg-blue-500 text-white block w-full rounded-lg p-2">
					Login
				</button>
				<p className="text-center mt-2">
					Don't have an account?{" "}
					<a className="underline cursor-pointer">Register</a>
				</p>
			</form>
		</div>
	);
};

export default Login;
