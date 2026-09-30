package config

import (
	"errors"
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Env string

const (
	EnvDevelopment Env = "development"
	EnvProduction  Env = "production"
)

type Config struct {
	DatabaseURL string
	ListenAddr  string
	Env         Env
}

var ErrMissingDatabaseURL = errors.New("NAPLATA_DATABASE_URL is not set")

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil && !errors.Is(err, os.ErrNotExist) {
		return nil, fmt.Errorf("load .env: %w", err)
	}

	cfg := &Config{
		DatabaseURL: os.Getenv("NAPLATA_DATABASE_URL"),
		ListenAddr:  getenv("NAPLATA_LISTEN_ADDR", ":8080"),
		Env:         Env(getenv("NAPLATA_ENV", string(EnvDevelopment))),
	}

	if cfg.DatabaseURL == "" {
		return nil, ErrMissingDatabaseURL
	}
	if cfg.Env != EnvDevelopment && cfg.Env != EnvProduction {
		return nil, fmt.Errorf("NAPLATA_ENV must be %q or %q, got %q", EnvDevelopment, EnvProduction, cfg.Env)
	}

	return cfg, nil
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
