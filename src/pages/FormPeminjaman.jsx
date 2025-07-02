import React, { useState } from 'react';
import './FormPeminjaman.css';

const FormPeminjaman = () => {
  const [formData, setFormData] = useState({
    namaPemohon: '',
    nomorBerkas: '',
    jenisPermintaan: 'Peminjaman',
    tanggalPeminjaman: '',
    keterangan: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Data dikirim:', formData);
    alert('Permintaan peminjaman telah dikirim!');
    // Reset form
    setFormData({
      namaPemohon: '',
      nomorBerkas: '',
      jenisPermintaan: 'Peminjaman',
      tanggalPeminjaman: '',
      keterangan: '',
    });
  };

  return (
    <div className="form-peminjaman-container">
      <h2>Form Peminjaman Loket</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nama Pemohon:</label>
          <input
            type="text"
            name="namaPemohon"
            value={formData.namaPemohon}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Nomor Berkas:</label>
          <input
            type="text"
            name="nomorBerkas"
            value={formData.nomorBerkas}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Jenis Permintaan:</label>
          <select
            name="jenisPermintaan"
            value={formData.jenisPermintaan}
            onChange={handleChange}
          >
            <option value="Peminjaman">Peminjaman</option>
            <option value="Pengembalian">Pengembalian</option>
            <option value="Lihat Arsip">Lihat Arsip</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tanggal Peminjaman:</label>
          <input
            type="date"
            name="tanggalPeminjaman"
            value={formData.tanggalPeminjaman}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Keterangan:</label>
          <textarea
            name="keterangan"
            value={formData.keterangan}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <button type="submit">Kirim Permintaan</button>
      </form>
    </div>
  );
};

export default FormPeminjaman;
