/**
 * @typedef {'a_voir' | 'en_cours' | 'termine' | 'pause' | 'abandonne'} AnimeStatus
 * @typedef {'haute' | 'moyenne' | 'faible'} Priority
 * @typedef {'VOSTFR' | 'VF' | 'VO'} Language
 * @typedef {'dark' | 'light' | 'system'} ThemeMode
 * @typedef {'grid' | 'list'} ViewMode
 * @typedef {'ajout' | 'modification' | 'progression' | 'termine' | 'suppression'} HistoryAction
 * @typedef {'success' | 'error' | 'info'} ToastTone
 *
 * @typedef {Object} Anime
 * @property {string} id
 * @property {string} title
 * @property {string} titleJapanese
 * @property {string} image
 * @property {string} synopsis
 * @property {string[]} genres
 * @property {string[]} studios
 * @property {string} author
 * @property {number} episodesTotal
 * @property {number} episodesWatched
 * @property {number} episodeDuration
 * @property {string} releaseDate
 * @property {string} season
 * @property {AnimeStatus} status
 * @property {number | null} rating
 * @property {string} comment
 * @property {Priority} priority
 * @property {string} platform
 * @property {Language} language
 * @property {string} malLink
 * @property {string} aniListLink
 * @property {boolean} isFavorite
 * @property {string[]} tags
 * @property {string[]} collections
 * @property {string} dateAdded
 * @property {string | null} dateFinished
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} AnimeInput
 * @property {string} title
 * @property {string} [titleJapanese]
 * @property {string} [image]
 * @property {string} [synopsis]
 * @property {string[]} [genres]
 * @property {string[]} [studios]
 * @property {string} [author]
 * @property {number} [episodesTotal]
 * @property {number} [episodesWatched]
 * @property {number} [episodeDuration]
 * @property {string} [releaseDate]
 * @property {string} [season]
 * @property {AnimeStatus} [status]
 * @property {number | null} [rating]
 * @property {string} [comment]
 * @property {Priority} [priority]
 * @property {string} [platform]
 * @property {Language} [language]
 * @property {string} [malLink]
 * @property {string} [aniListLink]
 * @property {boolean} [isFavorite]
 * @property {string[]} [tags]
 * @property {string[]} [collections]
 * @property {string} [dateAdded]
 * @property {string | null} [dateFinished]
 *
 * @typedef {Object} AnimeFilters
 * @property {string} [search]
 * @property {AnimeStatus | ''} [status]
 * @property {Priority | ''} [priority]
 * @property {string} [genre]
 * @property {string} [studio]
 * @property {string} [platform]
 * @property {number | string} [year]
 * @property {boolean} [favorite]
 * @property {string} [sortBy]
 * @property {'asc' | 'desc'} [order]
 * @property {number} [page]
 * @property {number} [limit]
 *
 * @typedef {Object} AnimeListResponse
 * @property {boolean} success
 * @property {Anime[]} data
 * @property {number} count
 * @property {number} page
 * @property {number} limit
 * @property {boolean} hasMore
 *
 * @typedef {Object} MetaItem
 * @property {string} name
 * @property {number} count
 *
 * @typedef {Object} DistributionItem
 * @property {string} name
 * @property {number} value
 *
 * @typedef {Object} AnimeMeta
 * @property {MetaItem[]} genres
 * @property {MetaItem[]} studios
 * @property {MetaItem[]} tags
 * @property {MetaItem[]} collections
 * @property {string[]} platforms
 * @property {number[]} years
 *
 * @typedef {Object} MonthlyActivity
 * @property {string} month
 * @property {number} count
 *
 * @typedef {Object} Stats
 * @property {number} total
 * @property {number} termine
 * @property {number} enCours
 * @property {number} aVoir
 * @property {number} pause
 * @property {number} abandonne
 * @property {number} totalEpisodesWatched
 * @property {number} totalMinutesWatched
 * @property {number} totalHoursWatched
 * @property {number} remainingEpisodes
 * @property {number} remainingMinutes
 * @property {number} remainingHours
 * @property {number} favoriteCount
 * @property {DistributionItem[]} genreDistribution
 * @property {DistributionItem[]} studioDistribution
 * @property {{ rating: number, count: number }[]} ratingDistribution
 * @property {Anime | null} lastAdded
 * @property {MonthlyActivity[]} monthlyActivity
 *
 * @typedef {Object} HistoryEntry
 * @property {string} id
 * @property {string | null} animeId
 * @property {string} animeTitle
 * @property {HistoryAction} action
 * @property {string} details
 * @property {string} createdAt
 *
 * @typedef {Object} ExternalAnime
 * @property {string} id
 * @property {'Jikan' | 'AniList'} source
 * @property {number | null} malId
 * @property {number | null} aniListId
 * @property {string} title
 * @property {string} titleJapanese
 * @property {string} image
 * @property {string} synopsis
 * @property {string[]} genres
 * @property {string[]} studios
 * @property {number} episodesTotal
 * @property {number} episodeDuration
 * @property {number | null} rating
 * @property {string} releaseDate
 * @property {string} season
 * @property {string} malLink
 * @property {string} aniListLink
 * @property {AnimeStatus} status
 *
 * @typedef {Object} Settings
 * @property {string} displayName
 *
 * @typedef {Object} ImportResult
 * @property {boolean} success
 * @property {number} imported
 * @property {number} skipped
 * @property {number} total
 * @property {{ index: number, message: string }[]} errors
 */

export {};
