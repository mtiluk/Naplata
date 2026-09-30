package web

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
)

func TestHandler(t *testing.T) {
	fsys := fstest.MapFS{
		"index.html":         {Data: []byte("<!doctype html>app")},
		"favicon.svg":        {Data: []byte("<svg/>")},
		"assets/index-a1.js": {Data: []byte("console.log(1)")},
	}
	h := Handler(fsys)

	tests := []struct {
		name       string
		path       string
		wantStatus int
		wantBody   string
		wantCache  string
	}{
		{"root serves index", "/", 200, "app", "no-cache"},
		{"index.html serves index", "/index.html", 200, "app", "no-cache"},
		{"real file", "/favicon.svg", 200, "<svg/>", ""},
		{"hashed asset is immutable", "/assets/index-a1.js", 200, "console.log(1)", "public, max-age=31536000, immutable"},
		{"client route falls back", "/invoices/42", 200, "app", "no-cache"},
		{"directory falls back", "/assets", 200, "app", "no-cache"},
		{"missing file with extension is 404", "/assets/old.js", 404, "", ""},
		{"traversal stays inside fs", "/../../etc/passwd", 200, "app", "no-cache"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, tt.path, nil))

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tt.wantStatus)
			}
			if tt.wantBody != "" && !strings.Contains(rec.Body.String(), tt.wantBody) {
				t.Errorf("body = %q, want it to contain %q", rec.Body.String(), tt.wantBody)
			}
			if got := rec.Header().Get("Cache-Control"); got != tt.wantCache {
				t.Errorf("Cache-Control = %q, want %q", got, tt.wantCache)
			}
		})
	}
}

func TestHandlerWithoutBuild(t *testing.T) {
	h := Handler(fstest.MapFS{".gitkeep": {}})

	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))

	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusServiceUnavailable)
	}
}
