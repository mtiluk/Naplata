package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"

	"github.com/mtiluk/naplata/internal/config"
	"github.com/mtiluk/naplata/internal/database"
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

	mux := http.NewServeMux()

	mux.Handle("/api/", http.NotFoundHandler())
	mux.Handle("/", web.Handler(web.Dist()))

	slog.Info("server listening", "addr", cfg.ListenAddr)
	log.Fatal(http.ListenAndServe(cfg.ListenAddr, mux))
}
