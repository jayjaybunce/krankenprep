# Go Conventions Cheat Sheet

A quick-reference for common Go idioms: naming, structure, and layout.

---

## 1. Project / Module Layout

### 1.1. Modules

Typical repo:

```
myapp/
  go.mod
  main.go          # simple app OR
  cmd/
    myapp/
      main.go      # larger apps
  internal/        # non-public packages
  pkg/             # optional, reusable public packages
```

### 1.2. Common Top-Level Directories

- `cmd/myapp/` – app entrypoint(s)
- `internal/` – private packages within the repo
- `pkg/` – optional public libraries
- Other common folders:
  - `api/`
  - `configs/`
  - `scripts/`
  - `deploy/`

---

## 2. Files & Packages

### 2.1. Filenames

- All lowercase.
- Use underscores for separation.
- File name indicates contents.

Examples:

```
user.go
user_repository.go
middleware.go
config.go
http_handler.go
```

Test files end with `_test.go`.

### 2.2. Package Names

- Lowercase, short, no underscores.
- Avoid stutter (`user.User` is fine; avoid `user.UserStruct`).

Good package names:

- `auth`
- `http`
- `store`
- `user`
- `config`

---

## 3. Naming Things

### 3.1. Exported vs Unexported

- Capitalized = exported (public).
- lowercase = unexported (private).

```go
type User struct {
    ID   int
    name string
}

func NewUser(id int, name string) *User { ... }

func (u *User) Name() string { return u.name }
```

### 3.2. General Naming Style

- Prefer short, meaningful:  
  `ctx`, `req`, `res`, `cfg`, `srv`, `db`, `err`.
- Avoid long verbose names.

### 3.3. Acronyms

Go idiom uses full caps:

```
HTTPServer
URLParser
UserID
ParseURL()
```

---

## 4. Functions, Methods & Receivers

### 4.1. Function Names

- Actions = verbs (`LoadUser`, `SaveUser`)
- Constructors = `NewType`

### 4.2. Receiver Names

- Use 1–2 letters:

```go
func (u *User) Validate() error {}
func (s *Server) Start() error {}
```

### 4.3. Method Names

- Name by behavior:

```go
Start()
Stop()
Get()
Set()
```

---

## 5. Interfaces

### 5.1. Naming

Usually `<Verb>er`:

```go
Reader
Writer
Formatter
Stringer
```

### 5.2. Size

- Keep interfaces small (1–3 methods).
- Define interfaces where they’re consumed, not produced.

---

## 6. Variables, Constants & Types

### 6.1. Variables

Camel case:

```
userID := 42
maxRetries := 3
httpClient := &http.Client{}
```

### 6.2. Constants

Grouped in blocks:

```go
const (
    defaultTimeout = 5 * time.Second
    maxConn        = 100
)
```

### 6.3. Domain Types

```go
type UserID int
type Email string
```

---

## 7. Error Handling Conventions

### 7.1. Return `error` Last

```go
func LoadUser(id int) (*User, error)
```

### 7.2. Named Error Vars

```go
var ErrInvalidID = errors.New("invalid id")
```

### 7.3. Wrapping Errors

```go
return nil, fmt.Errorf("load user %d: %w", id, err)
```

---

## 8. Testing Conventions

### 8.1. Test Names

- File: `file_test.go`
- Func: `TestXxx(t *testing.T)`

### 8.2. Table-Driven Tests

```go
tests := []struct{
    name string
    a, b int
    want int
}{ ... }
```

### 8.3. Package Choice

- `mypkg` → white-box tests
- `mypkg_test` → black-box tests

---

## 9. Comments & Documentation

### 9.1. Doc Comments

Use full sentences starting with the thing you’re documenting:

```go
// User represents a registered user.
```

### 9.2. Inline Comments

Explain why something happens, not what.

---

## 10. Package-Level APIs

### 10.1. Constructors

```go
func NewServer(addr string) *Server
```

### 10.2. Option Pattern

Useful for optional settings:

```go
type ServerOption func(*Server)
```

---

## 11. Context & Timeouts

### 11.1. Context as First Parameter

```go
func (s *Store) GetUser(ctx context.Context, id int)
```

### 11.2. Don’t store contexts in structs

Always pass it down explicitly.

---

## 12. Logging & Configuration

### 12.1. Logging

Inject or pass a logger rather than global vars.

### 12.2. Configuration Struct

```go
type Config struct {
    Addr string
    DB   string
}
```

---

## 13. Example Project Layout

```
myapp/
  go.mod
  cmd/
    myapp/
      main.go
  internal/
    http/
      server.go
      handler.go
    store/
      store.go
      user.go
  pkg/
    version/
      version.go
```

Basic main:

```go
func main() {
    s := store.NewStore("postgres://...")
    srv := http.NewServer(":8080", s, log.Default())
    srv.Start()
}
```

---

## 14. Quick Do / Don’t Summary

### Do

- Use short names (`cfg`, `srv`, `db`).
- Group code into meaningful packages.
- Keep interfaces tiny.
- Use `cmd/` for binaries.
- Use `internal/` to hide internals.
- Use lowercase package names.

### Don’t

- Overuse `utils.go`.
- Export everything.
- Make huge “god structs.”
- Use long Java-style names.

---
