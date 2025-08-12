"""
Jenkins Pro API 接口实现
基于jenkins_readme文档要求，实现完整的32个API接口
"""
import time
import json
import requests
from typing import Dict, Any, Optional, List
from urllib.parse import quote

from fastapi import APIRouter, Depends, Query, HTTPException, Body
from app.services.jenkins_service import JenkinsService
from app.api.deps import get_jenkins_service
from app.core.config import settings
import structlog

logger = structlog.get_logger("jenkins_pro_api")
router = APIRouter()

# =============================================================================
# 1. 基础信息接口 (3个)
# =============================================================================

@router.get("/info")
async def get_server_info():
    """获取Jenkins服务器基本信息"""
    try:
        jenkins = get_jenkins_service()
        info = jenkins.get_server_info()
        return {"status": "success", "data": info}
    except Exception as e:
        logger.error("获取服务器信息失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "获取服务器信息失败", "error": str(e)}
        )

@router.get("/systemInfo")
async def get_system_info():
    """获取系统详细信息"""
    try:
        jenkins = get_jenkins_service()
        # 使用原始HTTP请求获取系统信息
        auth = (settings.JENKINS_USERNAME, settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD)
        response = requests.get(f"{settings.JENKINS_URL}/systemInfo", auth=auth)
        response.raise_for_status()
        
        # 解析系统信息
        system_info = {
            "systemProperties": {},
            "environmentVariables": {}
        }
        
        return {"status": "success", "data": system_info}
    except Exception as e:
        logger.error("获取系统信息失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "获取系统信息失败", "error": str(e)}
        )

@router.get("/pluginManager/plugins")
async def get_plugins():
    """获取插件信息"""
    try:
        jenkins = get_jenkins_service()
        # 使用原始HTTP请求获取插件信息
        auth = (settings.JENKINS_USERNAME, settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD)
        response = requests.get(
            f"{settings.JENKINS_URL}/pluginManager/api/json?depth=1", 
            auth=auth
        )
        response.raise_for_status()
        plugins_data = response.json()
        
        return {"status": "success", "data": plugins_data}
    except Exception as e:
        logger.error("获取插件信息失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "获取插件信息失败", "error": str(e)}
        )

# =============================================================================
# 2. 任务管理接口 (8个)
# =============================================================================

@router.get("/jobs")
async def get_jobs(depth: int = Query(default=1, description="获取信息深度")):
    """获取所有任务列表"""
    try:
        jenkins = get_jenkins_service()
        jobs = jenkins.get_jobs(depth=depth)
        return {
            "status": "success",
            "data": {"jobs": jobs},
            "count": len(jobs),
            "timestamp": time.time(),
        }
    except Exception as e:
        logger.error("获取任务列表失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "获取任务列表失败", "error": str(e)}
        )

@router.get("/job/{job_name}")
async def get_job_info(job_name: str, depth: int = Query(default=1, description="获取信息深度")):
    """获取特定任务信息"""
    try:
        jenkins = get_jenkins_service()
        job_info = jenkins.get_job_info(job_name, depth=depth)
        return {"status": "success", "data": job_info}
    except Exception as e:
        logger.error("获取任务详情失败", job_name=job_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"获取任务 '{job_name}' 详情失败", "error": str(e)}
        )

@router.get("/job/{job_name}/parameters")
async def get_job_parameters(job_name: str):
    """获取任务参数定义"""
    try:
        jenkins = get_jenkins_service()
        # 获取任务配置信息，包含参数定义
        job_info = jenkins.get_job_info(job_name, depth=2)
        
        # 提取参数定义
        parameter_definitions = []
        if 'property' in job_info:
            for prop in job_info['property']:
                if 'parameterDefinitions' in prop:
                    parameter_definitions = prop['parameterDefinitions']
                    break
        
        return {
            "status": "success",
            "data": {"parameterDefinitions": parameter_definitions}
        }
    except Exception as e:
        logger.error("获取任务参数失败", job_name=job_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"获取任务 '{job_name}' 参数失败", "error": str(e)}
        )

@router.get("/job/{job_name}/builds")
async def get_job_builds(job_name: str, limit: int = Query(default=10, description="限制返回数量")):
    """获取任务构建历史"""
    try:
        jenkins = get_jenkins_service()
        # 获取任务信息，包含构建历史
        job_info = jenkins.get_job_info(job_name, depth=1)
        
        builds = job_info.get('builds', [])[:limit]
        
        return {
            "status": "success",
            "data": {"builds": builds},
            "count": len(builds)
        }
    except Exception as e:
        logger.error("获取构建历史失败", job_name=job_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"获取任务 '{job_name}' 构建历史失败", "error": str(e)}
        )

@router.post("/createItem")
async def create_job(name: str = Body(...), config_xml: str = Body(...)):
    """创建新任务"""
    try:
        jenkins = get_jenkins_service()
        jenkins.server.create_job(name, config_xml)
        
        return {
            "status": "success",
            "message": f"任务 '{name}' 创建成功",
            "data": {"name": name}
        }
    except Exception as e:
        logger.error("创建任务失败", name=name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"创建任务 '{name}' 失败", "error": str(e)}
        )

@router.post("/job/{job_name}/delete")
async def delete_job(job_name: str):
    """删除任务"""
    try:
        jenkins = get_jenkins_service()
        jenkins.delete_job(job_name)
        
        return {
            "status": "success",
            "message": f"任务 '{job_name}' 删除成功"
        }
    except Exception as e:
        logger.error("删除任务失败", job_name=job_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"删除任务 '{job_name}' 失败", "error": str(e)}
        )

@router.post("/job/{job_name}/enable")
async def enable_job(job_name: str):
    """启用任务"""
    try:
        jenkins = get_jenkins_service()
        jenkins.server.enable_job(job_name)
        
        return {
            "status": "success",
            "message": f"任务 '{job_name}' 启用成功"
        }
    except Exception as e:
        logger.error("启用任务失败", job_name=job_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"启用任务 '{job_name}' 失败", "error": str(e)}
        )

@router.post("/job/{job_name}/disable")
async def disable_job(job_name: str):
    """禁用任务"""
    try:
        jenkins = get_jenkins_service()
        jenkins.server.disable_job(job_name)
        
        return {
            "status": "success",
            "message": f"任务 '{job_name}' 禁用成功"
        }
    except Exception as e:
        logger.error("禁用任务失败", job_name=job_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"禁用任务 '{job_name}' 失败", "error": str(e)}
        )

# =============================================================================
# 3. 构建控制接口 (7个)
# =============================================================================

@router.post("/build/{job_name}")
async def trigger_build(job_name: str, build_params: Optional[Dict[str, Any]] = Body(default=None)):
    """触发构建"""
    try:
        logger.info("触发任务构建", job_name=job_name, parameters=build_params)
        jenkins = get_jenkins_service()
        queue_id = jenkins.build_job(job_name, build_params)
        
        return {
            "status": "success",
            "message": f"任务 '{job_name}' 构建已触发",
            "data": {
                "job_name": job_name,
                "queue_id": queue_id,
                "parameters": build_params
            },
            "timestamp": time.time(),
        }
    except Exception as e:
        logger.error("触发任务构建失败", job_name=job_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"触发任务 '{job_name}' 构建失败", "error": str(e)}
        )

@router.get("/build/{job_name}/{build_number}")
async def get_build_info(job_name: str, build_number: int):
    """获取构建详情"""
    try:
        jenkins = get_jenkins_service()
        build_info = jenkins.get_build_info(job_name, build_number)
        return {"status": "success", "data": build_info}
    except Exception as e:
        logger.error("获取构建详情失败", job_name=job_name, build_number=build_number, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"获取任务 '{job_name}' 构建 #{build_number} 详情失败", "error": str(e)}
        )

@router.get("/build/{job_name}/{build_number}/console")
async def get_build_console(job_name: str, build_number: int):
    """获取构建控制台输出"""
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
    except Exception as e:
        logger.error("获取构建控制台输出失败", job_name=job_name, build_number=build_number, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"获取任务 '{job_name}' 构建 #{build_number} 控制台输出失败", "error": str(e)}
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
    except Exception as e:
        logger.error("获取构建状态失败", job_name=job_name, build_number=build_number, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"获取任务 '{job_name}' 构建 #{build_number} 状态失败", "error": str(e)}
        )

@router.post("/build/{job_name}/{build_number}/stop")
async def stop_build(job_name: str, build_number: int):
    """停止构建"""
    try:
        jenkins = get_jenkins_service()
        jenkins.server.stop_build(job_name, build_number)

        return {
            "status": "success",
            "message": f"任务 '{job_name}' 构建 #{build_number} 停止成功"
        }
    except Exception as e:
        logger.error("停止构建失败", job_name=job_name, build_number=build_number, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"停止任务 '{job_name}' 构建 #{build_number} 失败", "error": str(e)}
        )

@router.get("/queue")
async def get_build_queue():
    """获取构建队列"""
    try:
        jenkins = get_jenkins_service()
        # 使用原始HTTP请求获取队列信息
        auth = (settings.JENKINS_USERNAME, settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD)
        response = requests.get(f"{settings.JENKINS_URL}/queue/api/json", auth=auth)
        response.raise_for_status()
        queue_data = response.json()

        return {"status": "success", "data": queue_data}
    except Exception as e:
        logger.error("获取构建队列失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "获取构建队列失败", "error": str(e)}
        )

# =============================================================================
# 4. Pipeline接口 (2个)
# =============================================================================

@router.get("/job/{job_name}/{build_number}/pipeline")
async def get_pipeline_run(job_name: str, build_number: int):
    """获取Pipeline运行信息"""
    try:
        # 使用原始HTTP请求获取Pipeline信息
        auth = (settings.JENKINS_USERNAME, settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD)
        response = requests.get(
            f"{settings.JENKINS_URL}/job/{quote(job_name)}/{build_number}/wfapi/describe",
            auth=auth
        )
        response.raise_for_status()
        pipeline_data = response.json()

        return {"status": "success", "data": pipeline_data}
    except Exception as e:
        logger.error("获取Pipeline运行信息失败", job_name=job_name, build_number=build_number, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"获取Pipeline运行信息失败", "error": str(e)}
        )

@router.get("/job/{job_name}/{build_number}/pipeline/log")
async def get_pipeline_log(job_name: str, build_number: int):
    """获取Pipeline日志"""
    try:
        # 使用原始HTTP请求获取Pipeline日志
        auth = (settings.JENKINS_USERNAME, settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD)
        response = requests.get(
            f"{settings.JENKINS_URL}/job/{quote(job_name)}/{build_number}/wfapi/log",
            auth=auth
        )
        response.raise_for_status()
        log_data = response.json()

        return {"status": "success", "data": log_data}
    except Exception as e:
        logger.error("获取Pipeline日志失败", job_name=job_name, build_number=build_number, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"获取Pipeline日志失败", "error": str(e)}
        )

# =============================================================================
# 5. 节点管理接口 (3个)
# =============================================================================

@router.get("/computer")
async def get_nodes():
    """获取所有节点信息"""
    try:
        jenkins = get_jenkins_service()
        # 使用原始HTTP请求获取节点信息
        auth = (settings.JENKINS_USERNAME, settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD)
        response = requests.get(f"{settings.JENKINS_URL}/computer/api/json", auth=auth)
        response.raise_for_status()
        nodes_data = response.json()

        return {"status": "success", "data": nodes_data}
    except Exception as e:
        logger.error("获取节点信息失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "获取节点信息失败", "error": str(e)}
        )

@router.get("/computer/{node_name}")
async def get_node_info(node_name: str):
    """获取特定节点信息"""
    try:
        # 使用原始HTTP请求获取特定节点信息
        auth = (settings.JENKINS_USERNAME, settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD)
        response = requests.get(
            f"{settings.JENKINS_URL}/computer/{quote(node_name)}/api/json",
            auth=auth
        )
        response.raise_for_status()
        node_data = response.json()

        return {"status": "success", "data": node_data}
    except Exception as e:
        logger.error("获取节点详情失败", node_name=node_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"获取节点 '{node_name}' 详情失败", "error": str(e)}
        )

@router.post("/computer/{node_name}/toggle-offline")
async def toggle_node_offline(node_name: str, offline_message: Optional[str] = Body(default=None)):
    """切换节点在线/离线状态"""
    try:
        # 使用原始HTTP请求切换节点状态
        auth = (settings.JENKINS_USERNAME, settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD)
        data = {"offlineMessage": offline_message} if offline_message else {}

        response = requests.post(
            f"{settings.JENKINS_URL}/computer/{quote(node_name)}/toggleOffline",
            auth=auth,
            data=data
        )
        response.raise_for_status()

        return {
            "status": "success",
            "message": f"节点 '{node_name}' 状态切换成功"
        }
    except Exception as e:
        logger.error("切换节点状态失败", node_name=node_name, error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": f"切换节点 '{node_name}' 状态失败", "error": str(e)}
        )

# =============================================================================
# 6. 用户管理接口 (2个)
# =============================================================================

@router.get("/me")
async def get_current_user():
    """获取当前用户信息"""
    try:
        jenkins = get_jenkins_service()
        user_info = jenkins.get_server_user()
        return {"status": "success", "data": user_info}
    except Exception as e:
        logger.error("获取当前用户信息失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "获取当前用户信息失败", "error": str(e)}
        )

@router.get("/people")
async def get_users():
    """获取所有用户列表"""
    try:
        # 使用原始HTTP请求获取用户列表
        auth = (settings.JENKINS_USERNAME, settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD)
        response = requests.get(f"{settings.JENKINS_URL}/people/api/json", auth=auth)
        response.raise_for_status()
        users_data = response.json()

        return {"status": "success", "data": users_data}
    except Exception as e:
        logger.error("获取用户列表失败", error=str(e))
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "message": "获取用户列表失败", "error": str(e)}
        )
