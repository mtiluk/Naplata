package main

import (
	"fmt"

	"github.com/mtiluk/naplata/internal/config"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		panic(err)
	}

	fmt.Println(config)

	// mux := http.NewServeMux()
	//
	// mux.Handle("/api/", http.NotFoundHandler())
	// mux.Handle("/", web.Handler(web.Dist()))
	//
	// addr := ":8080"
	// log.Printf("listening on %s", addr)
	// log.Fatal(http.ListenAndServe(addr, mux))
}
