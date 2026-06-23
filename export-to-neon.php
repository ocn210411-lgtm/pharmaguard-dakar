<?php
// ============================================================
//  Exporte les données MySQL → SQL compatible PostgreSQL/Neon
//  Exécuter : php export-to-neon.php > data.sql
// ============================================================
$pdo = new PDO('mysql:host=localhost;dbname=pharmaguard_dakar;port=8888;charset=utf8mb4',
    'root', 'root', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

function q($v) {
    if ($v === null) return 'NULL';
    return "'" . str_replace(["'", "\\"], ["''", "\\\\"], $v) . "'";
}

echo "-- ============================================================\n";
echo "--  PharmaGuard Dakar – Import données vers Neon PostgreSQL\n";
echo "--  Généré le " . date('Y-m-d H:i:s') . "\n";
echo "-- ============================================================\n\n";

// ── 1. Communes ──────────────────────────────────────────────
echo "-- Communes\n";
$rows = $pdo->query("SELECT * FROM communes ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "INSERT INTO communes (id,name,slug,description,is_active) VALUES ("
        . $r['id'] . "," . q($r['name']) . "," . q($r['slug']) . ","
        . q($r['description']) . "," . ($r['is_active'] ? 'true' : 'false')
        . ") ON CONFLICT (id) DO NOTHING;\n";
}
// Réinitialiser la séquence
echo "SELECT setval('communes_id_seq', (SELECT MAX(id) FROM communes));\n\n";

// ── 2. Pharmacies ────────────────────────────────────────────
echo "-- Pharmacies\n";
$rows = $pdo->query("SELECT * FROM pharmacies ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "INSERT INTO pharmacies (id,commune_id,name,doctor,address,phone,latitude,longitude,is_active) VALUES ("
        . $r['id'] . "," . $r['commune_id'] . "," . q($r['name']) . ","
        . q($r['doctor'] ?? null) . "," . q($r['address'] ?? null) . ","
        . q($r['phone'] ?? null) . ","
        . ($r['latitude']  ? $r['latitude']  : 'NULL') . ","
        . ($r['longitude'] ? $r['longitude'] : 'NULL') . ","
        . ($r['is_active'] ? 'true' : 'false')
        . ") ON CONFLICT (id) DO NOTHING;\n";
}
echo "SELECT setval('pharmacies_id_seq', (SELECT MAX(id) FROM pharmacies));\n\n";

// ── 3. Admins ─────────────────────────────────────────────────
echo "-- Admins\n";
$rows = $pdo->query("SELECT * FROM admins ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "INSERT INTO admins (id,username,password_hash,full_name,email,role,commune_id,is_active) VALUES ("
        . $r['id'] . "," . q($r['username']) . "," . q($r['password_hash']) . ","
        . q($r['full_name'] ?? null) . "," . q($r['email'] ?? null) . ","
        . q($r['role']) . ","
        . ($r['commune_id'] ? $r['commune_id'] : 'NULL') . ","
        . ($r['is_active'] ? 'true' : 'false')
        . ") ON CONFLICT (id) DO NOTHING;\n";
}
echo "SELECT setval('admins_id_seq', (SELECT MAX(id) FROM admins));\n\n";

// ── 4. Gardes (par lots de 500) ───────────────────────────────
echo "-- Gardes de nuit et dimanche\n";
$total = $pdo->query("SELECT COUNT(*) FROM garde")->fetchColumn();
$offset = 0; $batch = 500;
while ($offset < $total) {
    $rows = $pdo->query("SELECT * FROM garde ORDER BY id LIMIT $batch OFFSET $offset")->fetchAll(PDO::FETCH_ASSOC);
    if (empty($rows)) break;
    echo "INSERT INTO garde (id,pharmacy_id,commune_id,garde_date,garde_type) VALUES\n";
    $parts = [];
    foreach ($rows as $r) {
        $parts[] = "(" . $r['id'] . "," . $r['pharmacy_id'] . "," . $r['commune_id']
            . ",'" . $r['garde_date'] . "','" . $r['garde_type'] . "')";
    }
    echo implode(",\n", $parts) . "\nON CONFLICT (pharmacy_id,garde_date,garde_type) DO NOTHING;\n\n";
    $offset += $batch;
}
echo "SELECT setval('garde_id_seq', (SELECT MAX(id) FROM garde));\n";
echo "\n-- Import terminé ✓\n";
