// Package genrouter

// @Copyright  Copyright (c) 2024 HotGo CLI

// @AutoGenerate Version 2.13.1
package genrouter

import "hotgo/addons/hgexample/controller/admin/sys"

func init() {
	LoginRequiredRouter = append(LoginRequiredRouter, sys.TenantOrder) // 多租户功能演示
}
