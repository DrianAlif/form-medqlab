-- Cloudflare D1 Database Schema for PDF Form Generator

-- 1. Documents table (Saved PDFs, drafts, history)
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'kosan', 'makan', 'lembur'
    title TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON string of form inputs, calculations, signatures
    total_amount INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Presets table (Saved employee names, departments, approvers, project codes)
CREATE TABLE IF NOT EXISTS presets (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL, -- 'employee', 'approver', 'project', 'rates'
    name TEXT NOT NULL,
    details TEXT, -- JSON string with extra details (e.g. NIK, Jabatan, Dept)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Digital Signatures storage (saved transparent signature PNGs/SVGs)
CREATE TABLE IF NOT EXISTS signatures (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'pemohon', 'hod', 'direktur', 'member'
    data_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial sample presets
INSERT OR IGNORE INTO presets (id, category, name, details) VALUES 
('p-1', 'employee', 'Alif Drian', '{"nik": "NPP-0033", "jabatan": "Implementator", "department": "Project"}'),
('p-2', 'approver', 'Ferry Lukito', '{"jabatan": "HOD", "department": "Project"}'),
('p-3', 'approver', 'Direktur', '{"jabatan": "Direktur"}'),
('p-4', 'project', 'LIS v2 MedQLab - RSCM Jakarta', '{"project": "LIS v2 MedQLab", "hospital": "RSCM Jakarta", "phase": "Pendampingan Medqlab"}');
-- 4. Remote Public Signing Tokens (1-Hour Expiring Links)
CREATE TABLE IF NOT EXISTS sign_tokens (
    token TEXT PRIMARY KEY,
    slot_field TEXT,
    slot_title TEXT,
    assigned_name TEXT,
    assigned_role TEXT,
    form_category TEXT,
    doc_title TEXT,
    total_amount REAL,
    doc_details TEXT,
    created_at INTEGER,
    expires_at INTEGER,
    status TEXT,
    signature TEXT,
    signed_at TEXT,
    signer_name TEXT
);
