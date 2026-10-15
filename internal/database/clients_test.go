package database

import (
	"context"
	"slices"
	"testing"
	"time"

	"github.com/mtiluk/naplata/internal/testdb"
)

func TestListClients(t *testing.T) {
	pool := testdb.New(t)
	store := NewStore(pool)

	day := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	testdb.InsertUser(t, pool, "Ada Lovelace", day)
	testdb.InsertUser(t, pool, "Grace Hopper", day.AddDate(0, 0, 1))
	testdb.InsertUser(t, pool, "Alan Turing", day.AddDate(0, 0, 2))

	tests := []struct {
		name  string
		p     ListClientsParams
		want  []string
		total int
	}{
		{"newest first", ListClientsParams{Sort: "created_at", Desc: true}, []string{"Alan", "Grace", "Ada"}, 3},
		{"name ascending", ListClientsParams{Sort: "name"}, []string{"Ada", "Alan", "Grace"}, 3},
		{"name descending", ListClientsParams{Sort: "name", Desc: true}, []string{"Grace", "Alan", "Ada"}, 3},
		{"search ignores case", ListClientsParams{Sort: "name", Search: "LOVELACE"}, []string{"Ada"}, 1},
		{"search email", ListClientsParams{Sort: "name", Search: "alan@"}, []string{"Alan"}, 1},
		{"search is literal", ListClientsParams{Sort: "name", Search: "%"}, []string{}, 0},
		{"pagination", ListClientsParams{Sort: "name", Limit: 2, Offset: 1}, []string{"Alan", "Grace"}, 3},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.p.Limit == 0 {
				tt.p.Limit = 10
			}
			clients, total, err := store.ListClients(context.Background(), tt.p)
			if err != nil {
				t.Fatal(err)
			}

			got := []string{}
			for _, c := range clients {
				got = append(got, c.GivenName)
			}
			if !slices.Equal(got, tt.want) || total != tt.total {
				t.Errorf("got %v (total %d), want %v (total %d)", got, total, tt.want, tt.total)
			}
		})
	}
}
