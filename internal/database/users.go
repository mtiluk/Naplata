package database

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var ErrEmailTaken = errors.New("email already registered")
var ErrUserNotFound = errors.New("user not found")

type User struct {
	ID           string    `db:"id"`
	Email        string    `db:"email"`
	GivenName    string    `db:"given_name"`
	FamilyName   string    `db:"family_name"`
	PasswordHash string    `db:"password_hash"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

type CreateUserParams struct {
	Email        string
	GivenName    string
	FamilyName   string
	PasswordHash string
}

func (s *Store) CreateUser(ctx context.Context, p CreateUserParams) (User, error) {
	rows, _ := s.pool.Query(ctx, `
		INSERT INTO users (email, given_name, family_name, password_hash)
		VALUES ($1, $2, $3, $4)
		RETURNING id, email, given_name, family_name, password_hash, created_at, updated_at`,
		p.Email, p.GivenName, p.FamilyName, p.PasswordHash,
	)
	u, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[User])

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == "users_email_key" {
		return User{}, ErrEmailTaken
	}
	if err != nil {
		return User{}, fmt.Errorf("create user: %w", err)
	}

	return u, nil
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (User, error) {
	rows, _ := s.pool.Query(ctx, `
		SELECT id, email, given_name, family_name, password_hash, created_at, updated_at
		FROM users
		WHERE lower(email) = lower($1)`,
		email,
	)
	u, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[User])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return User{}, ErrUserNotFound
		}

		return User{}, fmt.Errorf("get user by email: %w", err)
	}

	return u, nil
}

func (s *Store) GetUserByID(ctx context.Context, id string) (User, error) {
	rows, _ := s.pool.Query(ctx, `
		SELECT id, email, given_name, family_name, password_hash, created_at, updated_at
		FROM users
		WHERE id = $1`,
		id,
	)
	u, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[User])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return User{}, ErrUserNotFound
		}

		return User{}, fmt.Errorf("get user by id: %w", err)
	}

	return u, nil
}
