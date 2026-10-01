package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"

	"github.com/mtiluk/naplata/internal/config"
	"github.com/mtiluk/naplata/internal/database"
	"github.com/mtiluk/naplata/internal/server"
	"github.com/mtiluk/naplata/migrations"
	"github.com/mtiluk/naplata/web"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	slog.Info("starting naplata", "env", cfg.Env)

	db, err := database.Connect(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	slog.Info("database connected")

	if err := migrations.Up(context.Background(), db); err != nil {
		log.Fatal(err)
	}

	slog.Info("migrations applied")

	sessionManager := server.NewSessionManager(cfg, db)

	h := server.NewHandler(database.NewStore(db), sessionManager)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/health", h.HealthEndpoint)
	mux.Handle("/api/", http.NotFoundHandler())
	mux.Handle("/", web.Handler(web.Dist()))

	// Authentication
	mux.HandleFunc("POST /api/v1/auth/login", h.LoginEndpoint)
	mux.HandleFunc("POST /api/v1/auth/register", h.RegisterEndpoint)
	mux.HandleFunc("POST /api/v1/auth/logout", h.LogoutEndpoint)

	// Current user
	mux.Handle("GET /api/v1/me", h.RequireAuth(http.HandlerFunc(h.MeEndpoint)))

	slog.Info("server listening", "addr", cfg.ListenAddr)
	log.Fatal(http.ListenAndServe(cfg.ListenAddr, sessionManager.LoadAndSave(mux)))
}
