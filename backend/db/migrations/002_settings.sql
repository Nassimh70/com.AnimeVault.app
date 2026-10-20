-- AnimeVault — réglages applicatifs
CREATE TABLE IF NOT EXISTS settings (
  `key`      VARCHAR(64)  NOT NULL,
  `value`    VARCHAR(512) NOT NULL,
  updated_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO settings (`key`, `value`) VALUES ('displayName', 'Nassim');
