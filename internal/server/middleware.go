package server

import (
	"net/http"
)

func (h *Handler) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if h.sessionManager.GetString(r.Context(), sessionUserIDKey) == "" {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "not logged in"})
			return
		}
		next.ServeHTTP(w, r)
	})
}
