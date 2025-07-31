import time
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging_config import setup_logging, logger
from app.api.endpoints import jenkins
from app.api.deps import get_jenkins_service

# 在应用启动前配置好日志
setup_logging()

def create_app() -> FastAPI:
    """创建并配置 FastAPI 应用"""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="简化的 Jenkins REST API 通信验证工具",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
    )

    # 配置 CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 请求日志中间件
    @app.middleware("http")
    async def log_requests(request: Request, call_next) -> Response:
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(
            "请求处理完成",
            method=request.method,
            url=str(request.url),
            status_code=response.status_code,
            duration_ms=round(process_time, 2),
        )
        return response

    # 包含 API 路由
    app.include_router(jenkins.router, prefix="/jenkins", tags=["Jenkins"])

    # 定义根路径和健康检查
    @app.get("/", tags=["General"])
    async def root():
        return {
            "message": "Jenkins Admin Backend",
            "version": settings.APP_VERSION,
            "status": "running"
        }

    @app.get("/health", tags=["General"])
    async def health_check():
        try:
            jenkins_svc = get_jenkins_service()
            server_info = jenkins_svc.get_server_info()
            jenkins_status = {
                "status": "connected",
                "url": settings.JENKINS_URL,
                "version": server_info.get("version", "unknown"),
            }
        except Exception as e:
            jenkins_status = {
                "status": "disconnected",
                "url": settings.JENKINS_URL,
                "error": str(e),
            }
        
        return {
            "status": "healthy" if jenkins_status["status"] == "connected" else "unhealthy",
            "timestamp": time.time(),
            "version": settings.APP_VERSION,
            "dependencies": { "jenkins": jenkins_status }
        }

    return app

# 创建应用实例以供 uvicorn 调用
app = create_app()

# 主程序入口
if __name__ == "__main__":
    logger.info(
        "启动 Jenkins Admin Backend",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        jenkins_url=settings.JENKINS_URL,
        debug=settings.DEBUG,
    )
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )