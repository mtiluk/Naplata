package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func (s *Store) HasPermission(ctx context.Context, userID, permission string) (bool, error) {
	var ok bool
	err := s.pool.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM user_roles ur
			JOIN role_permissions rp ON rp.role_id = ur.role_id
			JOIN permissions p ON p.id = rp.permission_id
			WHERE ur.user_id = $1 AND p.name = $2
		)`,
		userID, permission,
	).Scan(&ok)
	if err != nil {
		return false, fmt.Errorf("has permission: %w", err)
	}

	return ok, nil
}

func (s *Store) GetUserPermissions(ctx context.Context, userID string) ([]string, error) {
	rows, _ := s.pool.Query(ctx, `
              SELECT DISTINCT p.name
              FROM user_roles ur
              JOIN role_permissions rp ON rp.role_id = ur.role_id
              JOIN permissions p ON p.id = rp.permission_id
              WHERE ur.user_id = $1
              ORDER BY p.name`,
		userID,
	)
	permissions, err := pgx.CollectRows(rows, pgx.RowTo[string])
	if err != nil {
		return nil, fmt.Errorf("get user permissions: %w", err)
	}
	if permissions == nil {
		permissions = []string{}
	}

	return permissions, nil
}
