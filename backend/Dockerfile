# =========================
# 1) Build stage
# =========================
FROM golang:1.25-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

# Cache deps
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build-time arguments (optional, if you need them during compilation)
ARG BUILD_VERSION=dev
ARG BUILD_TIME

# Build binary (main.go at repo root; adjust if needed)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags "-X main.Version=${BUILD_VERSION} -X main.BuildTime=${BUILD_TIME}" \
    -o krankenprep-backend .

# =========================
# 2) Runtime stage
# =========================
FROM alpine:3.20

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /app/krankenprep-backend .

# Runtime environment variables (these can be overridden at deployment)
ENV PORT=8080
ENV DESCOPE_PROJECT_ID=""
ENV DESCOPE_MANAGEMENT_KEY=""
ENV WCL_CLIENT_ID=""
ENV WCL_SECRET=""
ENV DB_HOST=""
ENV DB_PORT=""
ENV DB_USER=""
ENV DB_PASSWORD=""
ENV DB_NAME=""

EXPOSE 8080

USER nobody

CMD ["./krankenprep-backend"]
