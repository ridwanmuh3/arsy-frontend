import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import FormPeminjaman from "./pages/FormPeminjaman";
import Requested from "./pages/Requested";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/peminjaman" element={<FormPeminjaman />}></Route>
        <Route path="/requested" element={<Requested />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
