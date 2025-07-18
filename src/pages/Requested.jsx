import { useState } from "react";
import "./Requested.css";
import { Icon } from "@iconify/react";

const Requested = () => {
  const [formData, setFormData] = useState({
    wakaf: "",
    NOMOR: "",
    TAHUN: "",
    DESA: "",
    KECAMATAN: "",
    KEPERLUAN: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data dikirim:", formData);
    alert("Permintaan peminjaman telah dikirim!");
    setFormData({
      wakaf: "",
      NOMOR: "",
      TAHUN: "",
      DESA: "",
      KECAMATAN: "",
      KEPERLUAN: "",
    });
  };

  return (
    <div className="dashboard">
      <header className="top-header">
        <div className="header-left">
          <img src="/ATRBPN.jpg" alt="Logo" className="logo" />
          <div>
            <div className="title-main">ATR/BPN</div>
            <div className="title-sub">Kab. Pangandaran</div>
          </div>
        </div>
        <div className="header-right">
          Loket <Icon icon="mdi:account-circle" width={24} />
        </div>
      </header>
      <hr className="divider" />

      <div className="form-card">
        <main className="main-content">
          <h2>Form Permintaan Peminjaman</h2>
          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-group1">
              <label>SHM/HGB/HP/HGU/WAKAF:</label>
              <select
                name="wakaf"
                value={formData.wakaf}
                onChange={handleChange}
              >
                <option value="SHM">SHM</option>
                <option value="HGB">HGB</option>
                <option value="HP">HP</option>
                <option value="WAKAF">WAKAF</option>
                <option value="SHT">SHT</option>
              </select>
            </div>

            <div className="form-group2">
              <label>NOMOR :</label>
              <input
                type="text"
                name="NOMOR"
                value={formData.SHT}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group3">
              <label>TAHUN : </label>
              <input
                type="text"
                name="TAHUN"
                value={formData.TAHUN}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group4">
              <label>DESA : </label>
              <input
                type="text"
                name="DESA"
                value={formData.DESA}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group5">
              <label>KECAMATAN : </label>
              <input
                type="text"
                name="KECAMATAN"
                value={formData.KECAMATAN}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group6">
              <label>KEPERLUAN:</label>
              <select
                name="KEPERLUAN"
                value={formData.KEPERLUAN}
                onChange={handleChange}
              >
                <option value="Peminjaman">Peminjaman</option>
                <option value="Pengembalian">Pengembalian</option>
                <option value="Lihat Arsip">Lihat Arsip</option>
              </select>
            </div>

            <div className="button-group">
              <button type="button" className="btn-lihat">
                Lihat
              </button>
              <button type="submit" className="btn-submit">
                Submit
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Requested;
