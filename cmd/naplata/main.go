package main

import (
	"log"
	"net/http"

	"github.com/mtiluk/naplata/internal/config"
	"github.com/mtiluk/naplata/web"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	mux.Handle("/api/", http.NotFoundHandler())
	mux.Handle("/", web.Handler(web.Dist()))

	log.Printf("listening on %s (%s)", cfg.ListenAddr, cfg.Env)
	log.Fatal(http.ListenAndServe(cfg.ListenAddr, mux))
}
