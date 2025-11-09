# Makefile for building Wails + Angular app

.PHONY: frontend prepare windows linux clean

release: windows linux

frontend:
	@echo "• Building Angular frontend..."
	@cd ../Angular && node scan-taiga-icons.js && ng build --configuration production
	@echo "• Angular build: Done."

	@echo "• Copying build output to Wails project..."
	@rm -rf frontend
	@mkdir ../Wails/frontend
	@cp -r ../Angular/dist/ frontend
	@echo "• Copy complete: Done."

windows: frontend
	@echo "• Building Wails app for Windows..."
	@wails build -s --platform windows -upx
	@echo "• Release build complete."

linux: frontend
	@echo "• Building Wails app for Linux..."
	@wails build -s --platform linux -upx
	@echo "• Linux build complete."

clean:
	@echo "• Cleaning up frontend build..."
	@rm -rf frontend
	@echo "• Clean complete."