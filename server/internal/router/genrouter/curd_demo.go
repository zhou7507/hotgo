// Package genrouter

// @Copyright  Copyright (c) 2025 HotGo CLI

// @AutoGenerate Version 2.18.6
package genrouter

import "hotgo/internal/controller/admin/sys"

func init() {
	LoginRequiredRouter = append(LoginRequiredRouter, sys.CurdDemo) // CURD列表
}
