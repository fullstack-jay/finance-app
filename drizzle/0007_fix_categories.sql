-- Clean up duplicate categories and standardize names
BEGIN;

-- Create a CTE to identify duplicates and keep only the first occurrence
WITH duplicates AS (
  SELECT 
    id,
    name,
    type,
    ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(name)), type ORDER BY id) as rn
  FROM category
)
-- Delete duplicates, keeping only the first occurrence
DELETE FROM category 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Update category names to Indonesian
UPDATE category SET name = 'Gaji' WHERE LOWER(TRIM(name)) = 'salary';
UPDATE category SET name = 'Freelance' WHERE LOWER(TRIM(name)) = 'freelance';
UPDATE category SET name = 'Investasi' WHERE LOWER(TRIM(name)) = 'investment';
UPDATE category SET name = 'Investasi' WHERE LOWER(TRIM(name)) = 'investment income';
UPDATE category SET name = 'Penjualan Produk' WHERE LOWER(TRIM(name)) = 'product sales';
UPDATE category SET name = 'Layanan' WHERE LOWER(TRIM(name)) = 'service revenue';
UPDATE category SET name = 'Konsultasi' WHERE LOWER(TRIM(name)) = 'consulting fees';
UPDATE category SET name = 'Penghasilan Lainnya' WHERE LOWER(TRIM(name)) = 'other income';
UPDATE category SET name = 'Penghasilan Lainnya' WHERE LOWER(TRIM(name)) = 'business';
UPDATE category SET name = 'Makanan & Minuman' WHERE LOWER(TRIM(name)) = 'food & dining';
UPDATE category SET name = 'Perumahan' WHERE LOWER(TRIM(name)) = 'housing';
UPDATE category SET name = 'Transportasi' WHERE LOWER(TRIM(name)) = 'transportation';
UPDATE category SET name = 'Kesehatan' WHERE LOWER(TRIM(name)) = 'healthcare';
UPDATE category SET name = 'Hiburan' WHERE LOWER(TRIM(name)) = 'entertainment';
UPDATE category SET name = 'Belanja' WHERE LOWER(TRIM(name)) = 'shopping';
UPDATE category SET name = 'Perawatan Diri' WHERE LOWER(TRIM(name)) = 'personal care';
UPDATE category SET name = 'Hadiah & Donasi' WHERE LOWER(TRIM(name)) = 'gifts & donations';
UPDATE category SET name = 'Utilitas' WHERE LOWER(TRIM(name)) = 'utilities';
UPDATE category SET name = 'Asuransi' WHERE LOWER(TRIM(name)) = 'insurance';
UPDATE category SET name = 'Pemeliharaan' WHERE LOWER(TRIM(name)) = 'maintenance';
UPDATE category SET name = 'Perjalanan' WHERE LOWER(TRIM(name)) = 'travel';
UPDATE category SET name = 'Gaji Karyawan' WHERE LOWER(TRIM(name)) = 'salaries';
UPDATE category SET name = 'Pemasaran' WHERE LOWER(TRIM(name)) = 'marketing';
UPDATE category SET name = 'Perlengkapan Kantor' WHERE LOWER(TRIM(name)) = 'office supplies';
UPDATE category SET name = 'Peralatan Kantor' WHERE LOWER(TRIM(name)) = 'office equipment';
UPDATE category SET name = 'Software' WHERE LOWER(TRIM(name)) = 'software';
UPDATE category SET name = 'Sewa' WHERE LOWER(TRIM(name)) = 'rent';
UPDATE category SET name = 'Makanan' WHERE LOWER(TRIM(name)) = 'meals';
UPDATE category SET name = 'Biaya Lainnya' WHERE LOWER(TRIM(name)) = 'other expenses';
UPDATE category SET name = 'Pendidikan' WHERE LOWER(TRIM(name)) = 'education';
UPDATE category SET name = 'Properti' WHERE LOWER(TRIM(name)) = 'property';
UPDATE category SET name = 'Kendaraan' WHERE LOWER(TRIM(name)) = 'vehicles';
UPDATE category SET name = 'Mesin' WHERE LOWER(TRIM(name)) = 'machinery';
UPDATE category SET name = 'Saham' WHERE LOWER(TRIM(name)) = 'stocks';
UPDATE category SET name = 'Obligasi' WHERE LOWER(TRIM(name)) = 'bonds';
UPDATE category SET name = 'Reksa Dana' WHERE LOWER(TRIM(name)) = 'mutual funds';
UPDATE category SET name = 'Real Estat' WHERE LOWER(TRIM(name)) = 'real estate';
UPDATE category SET name = 'Kripto' WHERE LOWER(TRIM(name)) = 'crypto';

COMMIT;