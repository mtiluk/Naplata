package main

import (
	"log"
	"net/http"

	"github.com/mtiluk/naplata/web"
)

func main() {
	mux := http.NewServeMux()

	mux.Handle("/api/", http.NotFoundHandler())
	mux.Handle("/", web.Handler(web.Dist()))

	addr := ":8080"
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
