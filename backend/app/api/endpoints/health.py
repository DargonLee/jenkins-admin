"""
系统健康检查端点

提供系统状态检查和 Jenkins 连接测试功能。
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import time
import asyncio

from app.core.config import settings
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger("health")

@router.get("/", summary="基础健康检查")
async def basic_health_check() -> Dict[str, Any]:
    """
    基础健康检查端点
    
    返回应用的基本状态信息
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "app_name": settings.APP_NAME,
    }

@router.get("/detailed", summary="详细健康检查")
async def detailed_health_check() -> Dict[str, Any]:
    """
    详细健康检查端点
    
    检查 Jenkins 服务连接状态
    """
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG,
        "checks": {}
    }
    
    # 检查 Jenkins 连接
    jenkins_status = await check_jenkins_connection()
    health_status["checks"]["jenkins"] = jenkins_status
    
    # 如果任何检查失败，整体状态为不健康
    if any(check["status"] != "healthy" for check in health_status["checks"].values()):
        health_status["status"] = "unhealthy"
    
    return health_status

async def check_jenkins_connection() -> Dict[str, Any]:
    """检查 Jenkins 服务器连接"""
    try:
        # 这里可以添加实际的 Jenkins 连接测试
        # 目前返回基于配置的状态
        if settings.JENKINS_URL and settings.JENKINS_USERNAME:
            return {
                "status": "healthy",
                "message": "Jenkins configuration available",
                "url": settings.JENKINS_URL,
                "username": settings.JENKINS_USERNAME,
            }
        else:
            return {
                "status": "warning",
                "message": "Jenkins not configured",
            }
    except Exception as e:
        logger.error("Jenkins health check failed", error=str(e))
        return {
            "status": "unhealthy",
            "message": f"Jenkins connection failed: {str(e)}",
        }



@router.get("/readiness", summary="就绪检查")
async def readiness_check() -> Dict[str, Any]:
    """
    就绪检查端点
    
    用于 Kubernetes 等容器编排系统的就绪探针
    """
    try:
        # 执行关键服务检查
        checks = await asyncio.gather(
            check_jenkins_connection(),
            return_exceptions=True
        )
        
        # 检查是否有关键服务不可用
        critical_failures = [
            check for check in checks 
            if isinstance(check, dict) and check.get("status") == "unhealthy"
        ]
        
        if critical_failures:
            raise HTTPException(
                status_code=503,
                detail={
                    "status": "not_ready",
                    "message": "Critical services unavailable",
                    "failures": critical_failures,
                }
            )
        
        return {
            "status": "ready",
            "timestamp": time.time(),
            "message": "Service is ready to accept requests",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Readiness check failed", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "message": f"Readiness check failed: {str(e)}",
            }
        )

@router.get("/liveness", summary="存活检查")
async def liveness_check() -> Dict[str, Any]:
    """
    存活检查端点
    
    用于 Kubernetes 等容器编排系统的存活探针
    """
    return {
        "status": "alive",
        "timestamp": time.time(),
        "message": "Service is alive",
    }