package testdb

import (
	"context"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/mtiluk/naplata/migrations"
)

const lockID = 4_284_102

func New(t *testing.T) *pgxpool.Pool {
	t.Helper()

	url := os.Getenv("NAPLATA_TEST_DATABASE_URL")
	if url == "" {
		t.Skip("NAPLATA_TEST_DATABASE_URL is not set")
	}

	ctx := context.Background()

	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		t.Fatalf("connect test database: %v", err)
	}
	t.Cleanup(pool.Close)

	lock, err := pool.Acquire(ctx)
	if err != nil {
		t.Fatalf("acquire lock connection: %v", err)
	}
	if _, err := lock.Exec(ctx, "SELECT pg_advisory_lock($1)", lockID); err != nil {
		t.Fatalf("lock test database: %v", err)
	}
	t.Cleanup(func() {
		lock.Exec(context.Background(), "SELECT pg_advisory_unlock($1)", lockID)
		lock.Release()
	})

	if err := migrations.Up(ctx, pool); err != nil {
		t.Fatalf("migrate test database: %v", err)
	}

	if _, err := pool.Exec(ctx, "TRUNCATE users, roles, permissions, sessions RESTART IDENTITY CASCADE"); err != nil {
		t.Fatalf("reset test database: %v", err)
	}

	return pool
}

func InsertUser(t *testing.T, pool *pgxpool.Pool, name string, createdAt time.Time) string {
	t.Helper()

	given, family, _ := strings.Cut(name, " ")
	var id string
	err := pool.QueryRow(context.Background(), `
		INSERT INTO users (email, given_name, family_name, password_hash, created_at)
		VALUES ($1, $2, $3, 'hash', $4)
		RETURNING id`,
		strings.ToLower(given)+"@example.com", given, family, createdAt,
	).Scan(&id)
	if err != nil {
		t.Fatalf("insert user: %v", err)
	}
	return id
}

func MakeStaff(t *testing.T, pool *pgxpool.Pool, userID string) {
	t.Helper()

	_, err := pool.Exec(context.Background(), `
		INSERT INTO user_roles (user_id, role_id)
		SELECT $1, id FROM roles WHERE name = 'admin'`,
		userID,
	)
	if err != nil {
		t.Fatalf("make staff: %v", err)
	}
}
