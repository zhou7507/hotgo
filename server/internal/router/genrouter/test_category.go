// Package genrouter

// @Copyright  Copyright (c) 2024 HotGo CLI

// @AutoGenerate Version 2.15.7
package genrouter

import "hotgo/internal/controller/admin/sys"

func init() {
	LoginRequiredRouter = append(LoginRequiredRouter, sys.TestCategory) // 测试分类
}
