import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import FormPeminjaman from './pages/FormPeminjaman'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path ="/FormPeminjaman" element={<FormPeminjaman />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
