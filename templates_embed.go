// Package templates provides embedded AI coding assistant templates for use
// from Go. The FS filesystem contains the same template files used by the
// npm CLI, under the path prefix "templates/".
//
// Example:
//
//	import (
//	    "io/fs"
//	    "github.com/djm204/agentic-team-templates"
//	)
//	data, _ := fs.ReadFile(templates.FS, "templates/web-frontend/CLAUDE.md")
package templates

import "embed"

// FS is the embedded filesystem containing all template files (markdown and
// directory structure). Paths are relative to the repo root, e.g.
// "templates/web-frontend/CLAUDE.md", "templates/_shared/core-principles.md".
//
// Use all:templates so directories like _shared are included.
//go:embed all:templates
var FS embed.FS
