# =========================
# 1) Build stage
# =========================
FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

# Cache deps
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary (main.go at repo root; adjust if needed)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o krankenprep-backend .

# =========================
# 2) Runtime stage
# =========================
FROM alpine:3.20

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /app/krankenprep-backend .

ENV PORT=8080
EXPOSE 8080

USER nobody

CMD ["./krankenprep-backend"]
