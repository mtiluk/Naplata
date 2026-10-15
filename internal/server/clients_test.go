package server

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/alexedwards/scs/v2"
	"github.com/mtiluk/naplata/internal/database"
	"github.com/mtiluk/naplata/internal/permissions"
	"github.com/mtiluk/naplata/internal/testdb"
)

func TestListClientsEndpoint(t *testing.T) {
	pool := testdb.New(t)
	store := database.NewStore(pool)
	if err := store.SeedPermissions(context.Background(), permissions.All); err != nil {
		t.Fatal(err)
	}

	day := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	client := testdb.InsertUser(t, pool, "Ada Lovelace", day)
	testdb.InsertUser(t, pool, "Grace Hopper", day.AddDate(0, 0, 1))
	staff := testdb.InsertUser(t, pool, "Staff Admin", day.AddDate(0, 0, 2))
	testdb.MakeStaff(t, pool, staff)

	sm := scs.New()
	h := NewHandler(store, sm)
	route := h.RequirePermission(http.HandlerFunc(h.ListClientsEndpoint), permissions.ClientsView)

	get := func(userID, query string) *httptest.ResponseRecorder {
		r := httptest.NewRequest(http.MethodGet, "/api/v1/admin/clients"+query, nil)
		ctx, _ := sm.Load(r.Context(), "")
		if userID != "" {
			sm.Put(ctx, sessionUserIDKey, userID)
		}
		w := httptest.NewRecorder()
		route.ServeHTTP(w, r.WithContext(ctx))
		return w
	}

	for _, tt := range []struct {
		user string
		code int
	}{
		{"", http.StatusUnauthorized},
		{client, http.StatusForbidden},
		{staff, http.StatusOK},
	} {
		if w := get(tt.user, ""); w.Code != tt.code {
			t.Errorf("user %q: status %d, want %d", tt.user, w.Code, tt.code)
		}
	}

	var body struct {
		Clients []database.Client
		Total   int
	}
	if err := json.NewDecoder(get(staff, "?sort=name&page=2&per_page=1").Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body.Total != 3 || len(body.Clients) != 1 || body.Clients[0].GivenName != "Grace" {
		t.Errorf("unexpected response: %+v", body)
	}
}
