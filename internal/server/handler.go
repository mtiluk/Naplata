package server

import (
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	db *pgxpool.Pool
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{db: db}
}

type healthResponse struct {
	Status   string `json:"status"`
	Database string `json:"database"`
}

func (h *Handler) HealthEndpoint(w http.ResponseWriter, r *http.Request) {
	resp := healthResponse{Status: "ok", Database: "ok"}
	code := http.StatusOK

	if err := h.db.Ping(r.Context()); err != nil {
		resp.Database = "unavailable"
		code = http.StatusServiceUnavailable
	}

	writeJSON(w, code, resp)
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}
