package server

import (
	"log/slog"
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

func (h *Handler) RequirePermission(next http.Handler, permission string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := h.sessionManager.GetString(r.Context(), sessionUserIDKey)
		if userID == "" {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "not logged in"})
			return
		}

		hasPermission, err := h.store.HasPermission(r.Context(), userID, permission)
		if err != nil {
			slog.Error("check permission", "permission", permission, "err", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
			return
		}
		if !hasPermission {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "permission denied"})
			return
		}

		next.ServeHTTP(w, r)
	})
}
