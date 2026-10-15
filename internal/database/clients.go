package database

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type Client struct {
	ID         string    `db:"id" json:"id"`
	Email      string    `db:"email" json:"email"`
	GivenName  string    `db:"given_name" json:"given_name"`
	FamilyName string    `db:"family_name" json:"family_name"`
	Company    *string   `db:"company" json:"company"`
	Status     string    `db:"status" json:"status"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
}

type ListClientsParams struct {
	Search string
	Sort   string
	Desc   bool
	Limit  int
	Offset int
}

var clientSortColumns = map[string]string{
	"name":       "lower(u.given_name || ' ' || u.family_name)",
	"created_at": "u.created_at",
}

func (s *Store) ListClients(ctx context.Context, p ListClientsParams) ([]Client, int, error) {
	order, ok := clientSortColumns[p.Sort]
	if !ok {
		return nil, 0, fmt.Errorf("list clients: unknown sort %q", p.Sort)
	}
	if p.Desc {
		order += " DESC"
	}

	rows, _ := s.pool.Query(ctx, `
		SELECT u.id, u.email, u.given_name, u.family_name, u.company, u.status, u.created_at, count(*) OVER () AS total
		FROM users u
		WHERE strpos(lower(u.given_name || ' ' || u.family_name || ' ' || u.email), lower($1)) > 0
		ORDER BY `+order+`, u.id
		LIMIT $2 OFFSET $3`,
		strings.TrimSpace(p.Search), p.Limit, p.Offset,
	)

	type clientRow struct {
		Client
		Total int `db:"total"`
	}
	result, err := pgx.CollectRows(rows, pgx.RowToStructByName[clientRow])
	if err != nil {
		return nil, 0, fmt.Errorf("list clients: %w", err)
	}

	clients := make([]Client, len(result))
	total := 0
	for i, row := range result {
		clients[i] = row.Client
		total = row.Total
	}

	return clients, total, nil
}
