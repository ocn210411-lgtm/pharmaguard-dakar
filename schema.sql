-- ============================================================
--  PharmaGuard Dakar – Schéma PostgreSQL (Neon)
--  À exécuter UNE SEULE FOIS dans la console Neon
-- ============================================================

CREATE TABLE IF NOT EXISTS communes (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pharmacies (
  id          SERIAL PRIMARY KEY,
  commune_id  INT NOT NULL REFERENCES communes(id),
  name        VARCHAR(200) NOT NULL,
  doctor      VARCHAR(255),
  address     TEXT,
  phone       VARCHAR(100),
  latitude    NUMERIC(10,7),
  longitude   NUMERIC(10,7),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS garde (
  id          SERIAL PRIMARY KEY,
  pharmacy_id INT NOT NULL REFERENCES pharmacies(id),
  commune_id  INT NOT NULL REFERENCES communes(id),
  garde_date  DATE NOT NULL,
  garde_type  VARCHAR(10) NOT NULL DEFAULT 'nuit' CHECK (garde_type IN ('nuit','dimanche')),
  UNIQUE (pharmacy_id, garde_date, garde_type)
);

CREATE INDEX IF NOT EXISTS idx_garde_date      ON garde(garde_date);
CREATE INDEX IF NOT EXISTS idx_garde_commune   ON garde(commune_id);
CREATE INDEX IF NOT EXISTS idx_garde_type      ON garde(garde_type);
CREATE INDEX IF NOT EXISTS idx_pharm_commune   ON pharmacies(commune_id);

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150),
  email         VARCHAR(200),
  role          VARCHAR(30) NOT NULL DEFAULT 'local_admin' CHECK (role IN ('super_admin','local_admin')),
  commune_id    INT REFERENCES communes(id),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);
