package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) PickFolder() string {
	result, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Choose Portraits Folder",
	})
	if err != nil {
		return ""
	}
	return result
}

func (a *App) GetImages(path string) (map[string]string, error) {
	imageFilesDic := map[string]string{}
	allowedExtensions := map[string]bool{
		".png": true,
		".jpg": true,
	}

	err := filepath.WalkDir(path, func(filePath string, d fs.DirEntry, errFile error) error {
		if errFile != nil {
			return errFile
		}

		if !d.IsDir() {
			ext := strings.ToLower(filepath.Ext(d.Name()))
			if allowedExtensions[ext] {
				// Read the file and encode to Base64
				data, err := os.ReadFile(filePath)
				if err != nil {
					return fmt.Errorf("could not read file %s: %w", filePath, err)
				}

				base64Str := base64.StdEncoding.EncodeToString(data)
				imageFilesDic[d.Name()] = fmt.Sprintf("data:image/%s;base64,%s", strings.TrimPrefix(ext, "."), base64Str)
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return imageFilesDic, nil
}
