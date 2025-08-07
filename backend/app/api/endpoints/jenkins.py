import time
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from app.services.jenkins_service import JenkinsService
from app.api.deps import get_jenkins_service
import structlog

logger = structlog.get_logger("jenkins_api")
router = APIRouter()

@router.get("/test-connection")
async def test_jenkins_connection():
    """测试 Jenkins 连接"""
    try:
        jenkins = get_jenkins_service()
        connection_info = jenkins.test_connection()
        
        if connection_info["connected"]:
            return {
                "status": "success",
                "message": "Jenkins 连接测试成功",
                "data": connection_info
            }
        else:
            raise HTTPException(
                status_code=503,
                detail={
                    "status": "error",
                    "message": "Jenkins 连接测试失败",
                    "data": connection_info
                }
            )
    except Exception as e:
        logger.error("Jenkins 连接测试异常", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Jenkins 连接测试异常",
                "error": str(e)
            }
        )

@router.get("/info")
async def get_jenkins_info():
    """获取 Jenkins 服务器信息"""
    try:
        jenkins = get_jenkins_service()
        info = jenkins.get_server_info()
        return {"status": "success", "data": info}
    except ConnectionError as e:
        logger.warning("Jenkins 服务不可用", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "message": "Jenkins 服务不可用",
                "error": str(e)
            }
        )
    except Exception as e:
        logger.error("获取 Jenkins 信息失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error", 
                "message": "获取 Jenkins 服务器信息失败",
                "error": str(e)
            }
        )


@router.get("/jobs")
async def list_jobs(depth: int = Query(default=1, description="获取信息深度")):
    """获取所有 Jenkins 任务"""
    try:
        jenkins = get_jenkins_service()
        jobs = jenkins.get_jobs(depth=depth)
        return {
            "status": "success",
            "data": jobs,
            "count": len(jobs),
            "timestamp": time.time(),
        }
    except ConnectionError as e:
        logger.warning("Jenkins 服务不可用", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "message": "Jenkins 服务不可用，请检查配置和连接",
                "error": str(e),
                "suggestion": "请确认 JENKINS_URL、JENKINS_USERNAME 和 JENKINS_PASSWORD/JENKINS_API_TOKEN 配置正确"
            }
        )
    except Exception as e:
        logger.error("获取任务列表失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "获取 Jenkins 任务列表失败", 
                "error": str(e)
            }
        )

@router.get("/job/{job_name}")
async def get_job_info(
    job_name: str, 
    depth: int = Query(default=1, description="获取信息深度")
):
    """获取特定任务详情"""
    try:
        jenkins = get_jenkins_service()
        job_info = jenkins.get_job_info(job_name, depth=depth)
        return {"status": "success", "data": job_info}
    except ConnectionError as e:
        logger.warning("Jenkins 服务不可用", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "message": "Jenkins 服务不可用",
                "error": str(e)
            }
        )
    except Exception as e:
        logger.error("获取任务详情失败", job_name=job_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": f"获取任务 '{job_name}' 详情失败",
                "error": str(e)
            }
        )

@router.post("/build/{job_name}")
async def build_job(
    job_name: str, 
    parameters: Optional[Dict[str, Any]] = None
):
    """触发任务构建"""
    try:
        logger.info("触发任务构建", job_name=job_name, parameters=parameters)
        jenkins = get_jenkins_service()
        # 只有当参数不为空时才传递参数
        # queue_id = jenkins.build_job(job_name, parameters if parameters else None)
        queue_id = jenkins.build_job(job_name)
        return {
            "status": "success",
            "message": f"任务 '{job_name}' 构建已触发",
            "data": { "job_name": job_name, "queue_id": queue_id, "parameters": parameters },
            "timestamp": time.time(),
        }
    except ConnectionError as e:
        logger.warning("Jenkins 服务不可用", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "message": "Jenkins 服务不可用",
                "error": str(e)
            }
        )
    except Exception as e:
        logger.error("触发任务构建失败", job_name=job_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": f"触发任务 '{job_name}' 构建失败",
                "error": str(e)
            }
        )

@router.get("/build/{job_name}/{build_number}")
async def get_build_info(job_name: str, build_number: int):
    """获取构建详情"""
    try:
        jenkins = get_jenkins_service()
        build_info = jenkins.get_build_info(job_name, build_number)
        return {"status": "success", "data": build_info}
    except ConnectionError as e:
        logger.warning("Jenkins 服务不可用", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "message": "Jenkins 服务不可用",
                "error": str(e)
            }
        )
    except Exception as e:
        logger.error("获取构建详情失败", job_name=job_name, build_number=build_number, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": f"获取任务 '{job_name}' 构建 #{build_number} 详情失败",
                "error": str(e)
            }
        )

@router.get("/build/{job_name}/{build_number}/console")
async def get_build_console_output(
    job_name: str, 
    build_number: int
):
    """获取构建控制台输出
    
    根据官方文档：get_build_console_output(name, number)
    获取完整的构建控制台输出
    """
    try:
        jenkins = get_jenkins_service()
        console_output = jenkins.get_build_console_output(job_name, build_number)
        
        return {
            "status": "success",
            "data": {
                "job_name": job_name,
                "build_number": build_number,
                "console_output": console_output,
                "output_length": len(console_output)
            },
            "timestamp": time.time(),
        }
    except ConnectionError as e:
        logger.warning("Jenkins 服务不可用", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "message": "Jenkins 服务不可用",
                "error": str(e)
            }
        )
    except Exception as e:
        logger.error("获取构建控制台输出失败", job_name=job_name, build_number=build_number, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": f"获取任务 '{job_name}' 构建 #{build_number} 控制台输出失败",
                "error": str(e)
            }
        )

@router.get("/build/{job_name}/{build_number}/status")
async def get_build_status(job_name: str, build_number: int):
    """获取构建状态"""
    try:
        jenkins = get_jenkins_service()
        build_info = jenkins.get_build_info(job_name, build_number)
        
        status = {
            "job_name": job_name,
            "build_number": build_number,
            "building": build_info.get('building', False),
            "result": build_info.get('result', 'UNKNOWN'),
            "duration": build_info.get('duration', 0),
            "timestamp": build_info.get('timestamp', 0),
            "url": build_info.get('url', ''),
            "estimated_duration": build_info.get('estimatedDuration', 0)
        }
        
        return {
            "status": "success",
            "data": status,
            "timestamp": time.time(),
        }
    except ConnectionError as e:
        logger.warning("Jenkins 服务不可用", error=str(e))
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "message": "Jenkins 服务不可用",
                "error": str(e)
            }
        )
    except Exception as e:
        logger.error("获取构建状态失败", job_name=job_name, build_number=build_number, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": f"获取任务 '{job_name}' 构建 #{build_number} 状态失败",
                "error": str(e)
            }
        )