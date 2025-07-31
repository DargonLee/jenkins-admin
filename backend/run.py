#!/usr/bin/env python3
"""
Jenkins Admin Backend 启动脚本

用于启动开发服务器的便捷脚本
"""

import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )