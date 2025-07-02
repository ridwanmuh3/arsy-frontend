import "./App.css";
import { Icon } from "@iconify/react";
import logo from "/Logo_BPN-KemenATR_(2017).png";

function App() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="sidebar-title">
          <img src={logo} alt="Logo ATR/BPN" className="logo" />
          ATR/BPN Kabupaten Pangandaran
        </h2>
        <ul className="sidebar-menu">
          <li>
            <Icon
              icon="material-symbols:manage-history"
              width="20"
              height="20"
              className="history"
            />
            History
          </li>
          <li>
            {" "}
            <Icon
              icon="material-symbols:manage-search"
              width="20"
              height="20"
              className="history"
            />
            Pencarian Berkas
          </li>
          <li>
            <Icon
              icon="material-symbols:business-messages-outline"
              width="20"
              height="20"
              className="history"
            />
            Requested Archive
          </li>
          <li>
            <Icon
              icon="material-symbols:logout"
              width="20"
              height="20"
              className="history"
            />
            Logout
          </li>
        </ul>
      </aside>
      <div className="main-area">
        <header className="top-bar">
          <span className="admin-label">
            <Icon icon="mdi-light:account" className="history" />
            Admin
          </span>
        </header>

        <main className="main-content"></main>
        <div className="storage-box">
          <div className="storage-header">
            <h2>Data Tempat Penyimpanan</h2>
            <div className="search-box">
              <label>search : </label>
              <input type="text" />
            </div>
          </div>
          <div className="border-tabel">
            <table className="storage-table">
              <thead>
                <tr>
                  <th>No Dokumen</th>
                  <th>Nama Pemilik</th>
                  <th>Mobile Loker</th>
                  <th>Loker</th>
                  <th>Rak</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
