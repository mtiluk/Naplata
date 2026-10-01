package server

import (
	"errors"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/mtiluk/naplata/internal/database"
)

type registerRequest struct {
	Email      string `json:"email" validate:"required,email,max=254"`
	Password   string `json:"password" validate:"min=8"`
	GivenName  string `json:"given_name" validate:"required,max=100"`
	FamilyName string `json:"family_name" validate:"max=100"`
}

type userResponse struct {
	ID         string    `json:"id"`
	Email      string    `json:"email"`
	GivenName  string    `json:"given_name"`
	FamilyName string    `json:"family_name"`
	CreatedAt  time.Time `json:"created_at"`
}

func (h *Handler) RegisterEndpoint(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := readJSON(w, r, &req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	req.Email = strings.TrimSpace(req.Email)
	req.GivenName = strings.TrimSpace(req.GivenName)
	req.FamilyName = strings.TrimSpace(req.FamilyName)

	if err := validate.Struct(req); err != nil {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"errors": validationErrors(err)})
		return
	}

	hash, err := hashPassword(req.Password)
	if err != nil {
		slog.Error("hash password", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	user, err := h.store.CreateUser(r.Context(), database.CreateUserParams{
		Email:        req.Email,
		GivenName:    req.GivenName,
		FamilyName:   req.FamilyName,
		PasswordHash: hash,
	})
	if errors.Is(err, database.ErrEmailTaken) {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "email already registered"})
		return
	}
	if err != nil {
		slog.Error("create user", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	// TODO: Handle registration email (add to queue)

	writeJSON(w, http.StatusCreated, userResponse{
		ID:         user.ID,
		Email:      user.Email,
		GivenName:  user.GivenName,
		FamilyName: user.FamilyName,
		CreatedAt:  user.CreatedAt,
	})
}

type loginRequest struct {
	Email    string `json:"email" validate:"required,email,max=254"`
	Password string `json:"password" validate:"required"`
}

var dummyHash, _ = hashPassword("dummy-password-for-timing")

func (h *Handler) LoginEndpoint(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := readJSON(w, r, &req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	req.Email = strings.TrimSpace(req.Email)

	if err := validate.Struct(req); err != nil {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"errors": validationErrors(err)})
		return
	}

	user, err := h.store.GetUserByEmail(r.Context(), req.Email)
	if err != nil && !errors.Is(err, database.ErrUserNotFound) {
		slog.Error("get user by email", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	hash := user.PasswordHash
	if err != nil {
		hash = dummyHash
	}

	ok, verr := verifyPassword(req.Password, hash)
	if verr != nil {
		slog.Error("verify password", "err", verr)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	if err != nil || !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid password"})
		return
	}

	if err := h.sessionManager.RenewToken(r.Context()); err != nil {
		slog.Error("renew session token", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}
	h.sessionManager.Put(r.Context(), sessionUserIDKey, user.ID)

	writeJSON(w, http.StatusOK, userResponse{
		ID:         user.ID,
		Email:      user.Email,
		GivenName:  user.GivenName,
		FamilyName: user.FamilyName,
		CreatedAt:  user.CreatedAt,
	})
}

func (h *Handler) LogoutEndpoint(w http.ResponseWriter, r *http.Request) {
	if err := h.sessionManager.Destroy(r.Context()); err != nil {
		slog.Error("destroy session", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) MeEndpoint(w http.ResponseWriter, r *http.Request) {
	userID := h.sessionManager.GetString(r.Context(), sessionUserIDKey)

	user, err := h.store.GetUserByID(r.Context(), userID)
	if errors.Is(err, database.ErrUserNotFound) {

		h.sessionManager.Destroy(r.Context())
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "not logged in"})
		return
	}
	if err != nil {
		slog.Error("get user by id", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	writeJSON(w, http.StatusOK, userResponse{
		ID:         user.ID,
		Email:      user.Email,
		GivenName:  user.GivenName,
		FamilyName: user.FamilyName,
		CreatedAt:  user.CreatedAt,
	})
}
