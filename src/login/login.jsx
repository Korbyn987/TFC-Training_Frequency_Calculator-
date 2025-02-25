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
    </div>
  );
}
