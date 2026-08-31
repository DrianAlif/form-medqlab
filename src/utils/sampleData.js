/**
 * Default sample data pre-populated to match exact template specifications
 */
import { TTD_ALIF_B64, TTD_TRI_B64 } from './signaturesData';

export const SAMPLE_SIGNATURE_ALIF = TTD_ALIF_B64;
export const SAMPLE_SIGNATURE_TRI = TTD_TRI_B64;
export const SAMPLE_SIGNATURE_IKHSAN = TTD_ALIF_B64;
export const SAMPLE_SIGNATURE_FERRY = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 80' width='180' height='80'><path d='M20,50 Q40,10 70,30 T110,40 Q130,20 160,35 M30,55 Q60,65 140,45' stroke='%23000' stroke-width='3' fill='none' stroke-linecap='round'/></svg>";

export const initialKosanData = {
  nomor: '',
  tanggal: '2026-08-27',
  dibayarkanKepada: '',
  keterangan: 'Pengajuan Kosan untuk RSCM\nperiode 09 SEPTEMBER 2026 - 9 OKTOBER 2026',
  pemohonNama: 'Alif Drian',
  pemohonRole: 'Pemohon',
  pemohonSign: SAMPLE_SIGNATURE_ALIF,
  hodNama: 'Ferry Lukito',
  hodRole: 'HOD',
  hodSign: SAMPLE_SIGNATURE_FERRY,
  direkturNama: '',
  direkturRole: 'Direktur',
  direkturSign: '',

  // Lampiran Page 2 Metadata
  project: 'LIS v2 MedQLab',
  rumahSakit: 'RSCM Jakarta',
  periode: '9 SEPTEMBER 2026 - 9 SOKTOBER 2026',
  tahap: 'Pendampingan Medqlab',
  rateNote: 'Jawa & Bali : Rp. 75.000 | Luar Jawa & Bali Rp. 90.000',
  
  // 3-Level Dynamic Architecture: Parent Category -> Sub-Category -> Item Lines
  parentCategories: [
    {
      id: 'p-1',
      title: 'Akomodasi',
      subCategories: [
        {
          id: 'sub-1-1',
          title: 'Kosan',
          items: [
            {
              id: 'k-item-1',
              deskripsi: 'Kosan 1 Kamar Per Bulan',
              rentangTanggal: '09/09/2026 - 09/10/2026',
              qty: 1,
              unit: 'Kamar',
              hargaSatuan: 1800000,
              informasi: ''
            }
          ]
        }
      ]
    },
    {
      id: 'p-2',
      title: 'Perjalanan',
      subCategories: [
        {
          id: 'sub-2-1',
          title: 'Listrik',
          items: [
            {
              id: 'k-item-2',
              deskripsi: 'Listrik untuk 1 Kamar',
              rentangTanggal: '09/09/2026 - 09/10/2026',
              qty: 1,
              unit: 'Kamar',
              hargaSatuan: 250000,
              informasi: ''
            }
          ]
        }
      ]
    }
  ]
};

export const initialMakanData = {
  nomor: '',
  tanggal: '2026-08-27',
  dibayarkanKepada: 'Alif Drian Al Hakim',
  keterangan: 'Pengajuan Uang Makan 1 SEPTEMBER- 30 SEPTEMBER 2026\nRumah Sakti Cipto Mangunkusumo\n1 - 30 SEPTEMBER 2026',
  pemohonNama: 'Alif Drian',
  pemohonRole: 'Pemohon',
  pemohonSign: SAMPLE_SIGNATURE_ALIF,
  hodNama: 'Ferry Lukito',
  hodRole: 'HOD',
  hodSign: SAMPLE_SIGNATURE_FERRY,
  direkturNama: '',
  direkturRole: 'Direktur',
  direkturSign: '',

  // Lampiran Page 2
  project: 'LIS MedQLab',
  rumahSakit: 'RSCM',
  periode: '1 - 30 SEPTEMBER 2026',
  tahap: 'Implementasi MedQLab',
  rateNote: 'Jawa & Bali : Rp. 75.000 | Luar Jawa & Bali Rp. 90.000',
  sectionTitle: 'Akomodasi',
  items: [
    {
      id: 'm-1',
      wbs: '1',
      tanggal: '01/09/2026 - 30/09/2026',
      description: 'Konsumsi TriAchmadi Priyambodo',
      qty: 30,
      unit: 'Hari',
      hargaSatuan: 50000,
      ttd: SAMPLE_SIGNATURE_TRI
    },
    {
      id: 'm-2',
      wbs: '2',
      tanggal: '01/09/2026 - 30/09/2026',
      description: 'Konsumsi Alif Drian',
      qty: 30,
      unit: 'Hari',
      hargaSatuan: 50000,
      ttd: SAMPLE_SIGNATURE_ALIF
    },
    {
      id: 'm-3',
      wbs: '3',
      tanggal: '01/09/2026 - 30/09/2026',
      description: 'Konsumsi Ikhsan akbar aryandi',
      qty: 30,
      unit: 'Hari',
      hargaSatuan: 50000,
      ttd: SAMPLE_SIGNATURE_IKHSAN
    }
  ]
};

export const initialLemburData = {
  nama: 'Alif',
  nik: 'NPP-0033',
  jabatan: 'Implementator',
  department: 'Project',
  bulan: 'Juli - Agustus 2026',

  dibuatOlehNama: 'Alif',
  dibuatOlehSign: SAMPLE_SIGNATURE_ALIF,
  disetujuiOlehNama: 'Ferry Lukito',
  disetujuiOlehSign: SAMPLE_SIGNATURE_FERRY,
  diketahuiOlehNama: '',
  diketahuiOlehSign: '',

  items: [
    { id: 'l-1', tanggal: '18/07/2026', hari: 'Sabtu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-2', tanggal: '19/07/2026', hari: 'Minggu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-3', tanggal: '25/07/2026', hari: 'Sabtu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-4', tanggal: '26/07/2026', hari: 'Minggu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-5', tanggal: '01/08/2026', hari: 'Sabtu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-6', tanggal: '02/08/2026', hari: 'Minggu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-7', tanggal: '08/08/2026', hari: 'Sabtu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-8', tanggal: '09/08/2026', hari: 'Minggu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-9', tanggal: '15/08/2026', hari: 'Sabtu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-10', tanggal: '16/08/2026', hari: 'Minggu', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true },
    { id: 'l-11', tanggal: '17/08/2026', hari: 'Senin (Hari Kemerdekaan)', keterangan: 'Support RSCM', waktu: '09.00 - 17.00', hariCount: 1, jamCount: 8, hodApproved: true }
  ]
};
