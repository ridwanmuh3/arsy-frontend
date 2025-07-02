import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      alert('Login berhasil!');
    } else {
      alert('Username atau password salah.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Bagian atas: Logo dan teks */}
       <div className="login-header">
  <img src="/ATRBPN.jpg" alt="Logo" className="login-logo" />
  <div className="login-title">
    <h5>ATR/Badan Pertanahan Nasional</h5>
    <h5>Kabupaten Pangandaran</h5>
  </div>
</div>
<hr className="card-divider" />

<div className="hlogin"> Halaman Login </div>

        <form onSubmit={handleSubmit}>
  <div className="form-group">
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="Username"
      required
    />
  </div>
  <div className="form-group">
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Password"
      required
    />
  </div>
  <button type="submit">Masuk</button>
</form>


        {/* Tulisan bawah */}
        <div className="login-footer">
          <p>Hak Cipta @2025 ATR/BPN Kabupaten Pangandaran</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
