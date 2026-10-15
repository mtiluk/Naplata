package server

import (
	"log/slog"
	"net/http"
	"strconv"

	"github.com/mtiluk/naplata/internal/database"
)

func (h *Handler) ListClientsEndpoint(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	sort := query.Get("sort")
	if sort != "name" {
		sort = "created_at"
	}
	order := query.Get("order")
	desc := order == "desc" || (order == "" && sort == "created_at")
	page := intParam(query.Get("page"), 1, 1, 1_000_000)
	perPage := intParam(query.Get("per_page"), 25, 1, 100)

	clients, total, err := h.store.ListClients(r.Context(), database.ListClientsParams{
		Search: query.Get("q"),
		Sort:   sort,
		Desc:   desc,
		Limit:  perPage,
		Offset: (page - 1) * perPage,
	})
	if err != nil {
		slog.Error("list clients", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"clients": clients, "total": total})
}

func intParam(value string, fallback, lo, hi int) int {
	n, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return max(lo, min(n, hi))
}
