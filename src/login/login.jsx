import React, { useState } from "react";
// add the css file here, such as the component within the code

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    // add login logic here
    e.preventDefault();
    console.log("Logging in with:", { username, password });
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an Account? <a href="/createAccount">Create Account</a>
      </p>
    </div>
  );
}
export default Login;
