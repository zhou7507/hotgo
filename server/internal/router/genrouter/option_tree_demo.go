// Package genrouter

// @Copyright  Copyright (c) 2025 HotGo CLI

// @AutoGenerate Version 2.17.8
package genrouter

import "hotgo/internal/controller/admin/sys"

func init() {
	LoginRequiredRouter = append(LoginRequiredRouter, sys.OptionTreeDemo) // 选项树表
}
