package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/alexedwards/scs/v2"
	"github.com/mtiluk/naplata/internal/database"
)

type Handler struct {
	store          *database.Store
	sessionManager *scs.SessionManager
}

func NewHandler(store *database.Store, sessionManager *scs.SessionManager) *Handler {
	return &Handler{store: store, sessionManager: sessionManager}
}

type healthResponse struct {
	Status   string `json:"status"`
	Database string `json:"database"`
}

func (h *Handler) HealthEndpoint(w http.ResponseWriter, r *http.Request) {
	resp := healthResponse{Status: "ok", Database: "ok"}
	code := http.StatusOK

	if err := h.store.Ping(r.Context()); err != nil {
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

func readJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(dst); err != nil {
		var syntaxErr *json.SyntaxError
		var typeErr *json.UnmarshalTypeError
		var maxErr *http.MaxBytesError

		const unknownField = "json: unknown field "

		switch {
		case errors.As(err, &syntaxErr):
			return fmt.Errorf("malformed JSON at position %d", syntaxErr.Offset)
		case errors.Is(err, io.ErrUnexpectedEOF):
			return errors.New("malformed JSON")
		case errors.As(err, &typeErr):
			return fmt.Errorf("invalid type for field %q", typeErr.Field)
		case errors.Is(err, io.EOF):
			return errors.New("request body is empty")
		case strings.HasPrefix(err.Error(), unknownField):
			return fmt.Errorf("unknown field %s", strings.TrimPrefix(err.Error(), unknownField))
		case errors.As(err, &maxErr):
			return fmt.Errorf("request body must not exceed %d bytes", maxErr.Limit)
		default:
			return err
		}
	}

	if dec.More() {
		return errors.New("request body must contain a single JSON object")
	}

	return nil
}
