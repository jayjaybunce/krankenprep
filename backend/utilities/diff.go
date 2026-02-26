package utilities

import (
	"strings"
)

func NormalizeMarkdown(s string) string {
	// Normalize line endings
	s = strings.ReplaceAll(s, "\r\n", "\n")
	s = strings.ReplaceAll(s, "\r", "\n")

	lines := strings.Split(s, "\n")

	for i := range lines {
		// Trim trailing whitespace only
		lines[i] = strings.TrimRight(lines[i], " \t")
	}

	s = strings.Join(lines, "\n")

	// Ensure trailing newline
	if !strings.HasSuffix(s, "\n") {
		s += "\n"
	}

	return s
}

type Document struct {
	Raw        string
	Normalized string
	Regions    []Region
}

type Block struct {
	Type string
	Text string
	Hash string
}

type Region struct {
	Key         string
	Level       int
	HeadingLine string
	HeadingText string
	Blocks      []Block
}

// DiffOp represents a single operation in a line-level diff.
type DiffOp struct {
	Type  string   `json:"type"`  // "equal", "insert", or "delete"
	Lines []string `json:"lines"` // lines belonging to this operation
}

// DiffLines computes a line-level diff between oldLines and newLines using the
// Wagner-Fischer LCS algorithm. Adjacent operations of the same type are merged
// into a single DiffOp.
func DiffLines(oldLines, newLines []string) []DiffOp {
	n := len(oldLines)
	m := len(newLines)

	// Build LCS DP table: lcs[i][j] = LCS length of oldLines[:i] and newLines[:j]
	lcs := make([][]int, n+1)
	for i := range lcs {
		lcs[i] = make([]int, m+1)
	}
	for i := 1; i <= n; i++ {
		for j := 1; j <= m; j++ {
			if oldLines[i-1] == newLines[j-1] {
				lcs[i][j] = lcs[i-1][j-1] + 1
			} else if lcs[i-1][j] >= lcs[i][j-1] {
				lcs[i][j] = lcs[i-1][j]
			} else {
				lcs[i][j] = lcs[i][j-1]
			}
		}
	}

	// Backtrack to produce the edit script (in reverse order).
	type rawOp struct {
		opType string
		line   string
	}
	var raw []rawOp
	i, j := n, m
	for i > 0 || j > 0 {
		if i > 0 && j > 0 && oldLines[i-1] == newLines[j-1] {
			raw = append(raw, rawOp{"equal", oldLines[i-1]})
			i--
			j--
		} else if j > 0 && (i == 0 || lcs[i][j-1] >= lcs[i-1][j]) {
			raw = append(raw, rawOp{"insert", newLines[j-1]})
			j--
		} else {
			raw = append(raw, rawOp{"delete", oldLines[i-1]})
			i--
		}
	}

	// Reverse (backtracking produces reverse order).
	for lo, hi := 0, len(raw)-1; lo < hi; lo, hi = lo+1, hi-1 {
		raw[lo], raw[hi] = raw[hi], raw[lo]
	}

	// Merge adjacent same-type ops into DiffOp entries.
	var ops []DiffOp
	for _, r := range raw {
		if len(ops) > 0 && ops[len(ops)-1].Type == r.opType {
			ops[len(ops)-1].Lines = append(ops[len(ops)-1].Lines, r.line)
		} else {
			ops = append(ops, DiffOp{Type: r.opType, Lines: []string{r.line}})
		}
	}

	return ops
}

// DiffMarkdown normalizes both markdown strings and returns a line-level diff.
func DiffMarkdown(oldContent, newContent string) ([]DiffOp, error) {
	oldLines := strings.Split(strings.TrimRight(NormalizeMarkdown(oldContent), "\n"), "\n")
	newLines := strings.Split(strings.TrimRight(NormalizeMarkdown(newContent), "\n"), "\n")
	return DiffLines(oldLines, newLines), nil
}

func GetHeadingLevel(input string) int {
	return len(input) - len(strings.TrimLeft(input, "#"))
}

func DetectHeading(input string) (bool, int) {
	level := GetHeadingLevel(input)
	if level >= 1 && level <= 6 {
		return true, level
	}
	return false, 0
}

func ExtractHeadingText(input string) string {
	return strings.TrimPrefix(input, "#")
}
