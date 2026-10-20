-- AnimeVault — schéma initial
-- Compatible MySQL 8.0.19+ et MariaDB 10.x (utf8mb4_unicode_ci).

CREATE TABLE IF NOT EXISTS animes (
  id               CHAR(36)          NOT NULL,
  title            VARCHAR(255)      NOT NULL,
  title_japanese   VARCHAR(255)      NOT NULL DEFAULT '',
  image            VARCHAR(1024)     NOT NULL DEFAULT '',
  synopsis         TEXT              NULL,
  author           VARCHAR(255)      NOT NULL DEFAULT '',
  episodes_total   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  episodes_watched SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  episode_duration SMALLINT UNSIGNED NOT NULL DEFAULT 24,
  release_date     DATE              NULL,
  season           VARCHAR(50)       NOT NULL DEFAULT '',
  status           ENUM('a_voir','en_cours','termine','pause','abandonne') NOT NULL DEFAULT 'a_voir',
  rating           DECIMAL(3,1)      NULL,
  comment          TEXT              NULL,
  priority         ENUM('haute','moyenne','faible') NOT NULL DEFAULT 'moyenne',
  platform         VARCHAR(50)       NOT NULL DEFAULT '',
  language         ENUM('VOSTFR','VF','VO') NOT NULL DEFAULT 'VOSTFR',
  mal_link         VARCHAR(512)      NOT NULL DEFAULT '',
  anilist_link     VARCHAR(512)      NOT NULL DEFAULT '',
  is_favorite      TINYINT(1)        NOT NULL DEFAULT 0,
  date_added       DATETIME(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  date_finished    DATETIME(3)       NULL,
  created_at       DATETIME(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT chk_animes_rating CHECK (rating IS NULL OR (rating >= 0 AND rating <= 10)),
  KEY idx_animes_status (status),
  KEY idx_animes_priority (priority),
  KEY idx_animes_favorite (is_favorite),
  KEY idx_animes_created (created_at),
  KEY idx_animes_release (release_date),
  KEY idx_animes_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS genres (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_genres_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS studios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_studios_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collections (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_collections_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS anime_genres (
  anime_id CHAR(36) NOT NULL,
  genre_id INT UNSIGNED NOT NULL,
  position TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (anime_id, genre_id),
  KEY idx_ag_anime_position (anime_id, position),
  KEY idx_ag_genre (genre_id),
  CONSTRAINT fk_ag_anime FOREIGN KEY (anime_id) REFERENCES animes(id) ON DELETE CASCADE,
  CONSTRAINT fk_ag_genre FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS anime_studios (
  anime_id CHAR(36) NOT NULL,
  studio_id INT UNSIGNED NOT NULL,
  position TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (anime_id, studio_id),
  KEY idx_as_anime_position (anime_id, position),
  KEY idx_as_studio (studio_id),
  CONSTRAINT fk_as_anime FOREIGN KEY (anime_id) REFERENCES animes(id) ON DELETE CASCADE,
  CONSTRAINT fk_as_studio FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS anime_tags (
  anime_id CHAR(36) NOT NULL,
  tag_id INT UNSIGNED NOT NULL,
  position TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (anime_id, tag_id),
  KEY idx_at_anime_position (anime_id, position),
  KEY idx_at_tag (tag_id),
  CONSTRAINT fk_at_anime FOREIGN KEY (anime_id) REFERENCES animes(id) ON DELETE CASCADE,
  CONSTRAINT fk_at_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS anime_collections (
  anime_id CHAR(36) NOT NULL,
  collection_id INT UNSIGNED NOT NULL,
  position TINYINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (anime_id, collection_id),
  KEY idx_ac_anime_position (anime_id, position),
  KEY idx_ac_collection (collection_id),
  CONSTRAINT fk_ac_anime FOREIGN KEY (anime_id) REFERENCES animes(id) ON DELETE CASCADE,
  CONSTRAINT fk_ac_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS history (
  id          CHAR(36)     NOT NULL,
  anime_id    CHAR(36)     NULL,
  anime_title VARCHAR(255) NOT NULL,
  action      ENUM('ajout','modification','progression','termine','suppression') NOT NULL,
  details     VARCHAR(500) NOT NULL DEFAULT '',
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_history_anime (anime_id),
  KEY idx_history_created (created_at),
  CONSTRAINT fk_history_anime FOREIGN KEY (anime_id) REFERENCES animes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
