import { describe, expect, test } from "bun:test";
import {
  clampPage,
  DATETIME_FALLBACK,
  findLoanNoteForRequest,
  formatDate,
  formatDateTime,
} from "./index";

describe("formatDateTime", () => {
  test("format Indonesia untuk nilai valid", () => {
    expect(formatDateTime("2024-01-15T10:30:45")).toBe(
      "15 Januari 2024 10:30:45",
    );
    expect(formatDateTime("2023-08-17T00:00:00")).toContain("Agustus 2023");
  });

  test("fallback untuk kosong / invalid / sampah", () => {
    expect(formatDateTime(undefined)).toBe(DATETIME_FALLBACK);
    expect(formatDateTime("")).toBe(DATETIME_FALLBACK);
    expect(formatDateTime("bukan-tanggal")).toBe(DATETIME_FALLBACK);
    expect(formatDateTime(" ".repeat(5))).toBe(DATETIME_FALLBACK);
  });
});

describe("formatDate", () => {
  test("tanggal saja tanpa jam", () => {
    expect(formatDate("2024-12-25T18:00:00")).toBe("25 Desember 2024");
  });

  test("fallback untuk kosong / invalid", () => {
    expect(formatDate(undefined)).toBe(DATETIME_FALLBACK);
    expect(formatDate("rusak")).toBe(DATETIME_FALLBACK);
  });
});

describe("findLoanNoteForRequest", () => {
  const notes = [
    {
      id: "1",
      nomor_berkas: "1001",
      nama_peminjam: "Nama Sama",
      jenis_hak: "Hak Milik",
      tahun: "2024",
      desa: "A",
      kecamatan: "B",
      keperluan: "X",
    },
    {
      id: "2",
      nomor_berkas: "1002",
      nama_peminjam: "Nama Sama",
      jenis_hak: "HGB",
      tahun: "2024",
      desa: "A",
      kecamatan: "B",
      keperluan: "Y",
    },
  ];

  test("memilih via nomor berkas walau nama duplikat", () => {
    const found = findLoanNoteForRequest(notes, {
      nomor_berkas: "1002",
      nama_pemilik: "Nama Sama",
    });
    expect(found?.id).toBe("2");
  });

  test("fallback ke nama bila nomor kosong", () => {
    const found = findLoanNoteForRequest(notes, {
      nomor_berkas: "",
      nama_pemilik: "Nama Sama",
    });
    expect(found?.id).toBe("1");
  });

  test("undefined bila tidak ada yang cocok", () => {
    expect(
      findLoanNoteForRequest(notes, {
        nomor_berkas: "9999",
        nama_pemilik: "Tidak Ada",
      }),
    ).toBeUndefined();
    expect(findLoanNoteForRequest([], { nomor_berkas: "1001" })).toBeUndefined();
  });
});

describe("clampPage", () => {
  test("dalam batas tidak berubah", () => {
    expect(clampPage(0, 25, 10)).toBe(0);
    expect(clampPage(2, 25, 10)).toBe(2);
  });

  test("mundur ke halaman terakhir saat data menyusut", () => {
    expect(clampPage(2, 5, 10)).toBe(0);
    expect(clampPage(5, 21, 10)).toBe(2);
  });

  test("edge: data kosong, halaman negatif, rows invalid", () => {
    expect(clampPage(3, 0, 10)).toBe(0);
    expect(clampPage(-2, 25, 10)).toBe(0);
    expect(clampPage(0, 25, 0)).toBe(0);
    expect(clampPage(0, 25, -1)).toBe(0);
  });
});
