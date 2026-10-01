package server

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/alexedwards/scs/pgxstore"
	"github.com/alexedwards/scs/v2"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/mtiluk/naplata/internal/config"
)

const sessionUserIDKey = "userID"

func NewSessionManager(cfg *config.Config, pool *pgxpool.Pool) *scs.SessionManager {
	prod := cfg.Env == config.EnvProduction

	sm := scs.New()
	sm.Store = pgxstore.New(pool)
	sm.HashTokenInStore = true
	sm.Lifetime = 12 * time.Hour
	sm.IdleTimeout = 30 * time.Minute

	sm.Cookie.Name = "naplata"
	sm.Cookie.HttpOnly = true
	sm.Cookie.Secure = prod
	sm.Cookie.SameSite = http.SameSiteLaxMode
	sm.Cookie.Path = "/"
	sm.Cookie.Persist = true

	sm.ErrorFunc = func(w http.ResponseWriter, r *http.Request, err error) {
		slog.Error("session", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
	}

	return sm
}
