# Applimetis Form & PDF Generator (React + Cloudflare Workers + D1)

A full-stack web application for automating official company PDF generation for:
1. **Uang Kosan** (Page 1: Permintaan Uang Muka voucher + Page 2: Budgeting breakdown)
2. **Uang Makan** (Page 1: Permintaan Uang Muka voucher + Page 2: Team member meal consumption breakdown with individual signatures)
3. **Uang Lembur / Kompensasi Kerja** (Landscape timesheet table with auto day detection and multi-tier approval signatures)

---

## Features

- **React + Vite Frontend**: Fast, reactive side-by-side editing with instant live PDF preview.
- **Client-Side High-Res PDF Generation**: Crisp vector text and exact layout preservation powered by `html2pdf.js` and standard print engine.
- **Automatic Indonesian Terbilang**: Converts amounts (e.g. `2.050.000` -> `# Dua Juta Lima Puluh Ribu Rupiah #`).
- **Indonesian Date & Day Helpers**: Auto-detects day names (`Sabtu`, `Minggu`, etc.) from selected dates.
- **Interactive Signature Canvas**: Draw signatures directly, pick preset official signatures, or upload transparent PNG files.
- **Cloudflare Workers + D1 Database**: Persist draft forms and generated PDF records to Cloudflare D1 SQLite database at the edge, with automatic offline `localStorage` fallback.

---

## Getting Started (Local Development)

### 1. Run the Frontend Locally:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 2. Build for Production:
```bash
npm run build
```

---

## Cloudflare Workers & D1 Deployment

### 1. Create your Cloudflare D1 Database:
```bash
npx wrangler d1 create form_db
```
Copy the generated `database_id` into `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "form_db"
database_id = "your-database-id-here"
```

### 2. Run Database Migrations:
- **Local SQLite D1 emulation**:
  ```bash
  npm run d1:init-local
  ```
- **Remote Cloudflare D1**:
  ```bash
  npm run d1:init-remote
  ```

### 3. Deploy to Cloudflare Workers:
```bash
npm run worker:deploy
```
