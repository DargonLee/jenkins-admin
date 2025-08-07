from typing import Dict, List, Any
import jenkins
import structlog
from fastapi import HTTPException
from app.core.config import settings

logger = structlog.get_logger("jenkins_service")

class JenkinsService:
    """Jenkins 服务封装"""
    
    def __init__(self):
        if not settings.JENKINS_USERNAME:
            raise ValueError("必须提供 JENKINS_USERNAME")
        
        # 优先使用 API Token，如果没有则使用密码
        auth_credential = settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD
        if not auth_credential:
            raise ValueError("必须提供 JENKINS_API_TOKEN 或 JENKINS_PASSWORD")
        
        try:
            self.server = jenkins.Jenkins(
                settings.JENKINS_URL, 
                username=settings.JENKINS_USERNAME, 
                password=auth_credential
            )
            
            # 测试连接
            user_info = self.server.get_whoami()
            logger.info(
                "Jenkins 服务初始化成功", 
                url=settings.JENKINS_URL,
                username=settings.JENKINS_USERNAME,
                authenticated_user=user_info.get('fullName', 'Unknown'),
                auth_method="API Token" if settings.JENKINS_API_TOKEN else "Password"
            )
        except Exception as e:
            logger.error(
                "Jenkins 服务初始化失败", 
                url=settings.JENKINS_URL,
                username=settings.JENKINS_USERNAME,
                error=str(e)
            )
            raise
    
    def test_connection(self) -> Dict[str, Any]:
        """测试 Jenkins 连接"""
        try:
            user_info = self.server.get_whoami()
            version = self.server.get_version()
            
            result = {
                "connected": True,
                "user": user_info,
                "version": version,
                "url": settings.JENKINS_URL,
                "auth_method": "API Token" if settings.JENKINS_API_TOKEN else "Password"
            }
            
            logger.info("Jenkins 连接测试成功", **result)
            return result
            
        except Exception as e:
            logger.error("Jenkins 连接测试失败", error=str(e))
            return {
                "connected": False,
                "error": str(e),
                "url": settings.JENKINS_URL
            }

    def get_server_user(self) -> str:
        """获取 Jenkins 服务器用户"""
        try:
            user = self.server.get_whoami()
            return user
        except Exception as e:
            logger.error("获取 Jenkins 服务器用户失败", error=str(e))
            raise

    def get_server_version(self) -> str:
        """获取 Jenkins 服务器版本"""
        try:
            version = self.server.get_version()
            return version
        except Exception as e:
            logger.error("获取 Jenkins 服务器版本失败", error=str(e))

    def get_server_info(self) -> Dict[str, Any]:
        """获取服务器信息"""
        try:
            info = self.server.get_info()
            logger.info("获取 Jenkins 服务器信息成功", version=info.get("version"))
            return info
        except Exception as e:
            logger.error("获取 Jenkins 服务器信息失败", error=str(e))
            raise
    
    def get_jobs(self, depth: int = 1) -> List[Dict[str, Any]]:
        """获取任务列表"""
        try:
            # python-jenkins 的 get_jobs 方法不支持 depth 参数
            # 我们使用默认的获取方式
            jobs = self.server.get_jobs()
            logger.info("获取任务列表成功", job_count=len(jobs))
            return jobs
        except Exception as e:
            logger.error("获取任务列表失败", error=str(e))
            raise
    
    def get_job_info(self, job_name: str, depth: int = 1) -> Dict[str, Any]:
        """获取任务详情"""
        try:
            job_info = self.server.get_job_info(job_name, depth=depth)
            logger.info("获取任务详情成功", job_name=job_name)
            return job_info
        except jenkins.NotFoundException:
            logger.warning("任务不存在", job_name=job_name)
            raise HTTPException(status_code=404, detail=f"任务 '{job_name}' 不存在")
        except Exception as e:
            logger.error("获取任务详情失败", job_name=job_name, error=str(e))
            raise
    
    def build_job(self, job_name: str, parameters: Dict[str, Any] = None) -> int:
        """触发任务构建"""
        try:
            logger.info("开始触发任务构建", job_name=job_name, parameters=parameters)
            if parameters:
                queue_id = self.server.build_job(job_name, parameters)
            else:
                queue_id = self.server.build_job(job_name)
            
            logger.info("触发任务构建成功", job_name=job_name, queue_id=queue_id)
            return queue_id
            
        except jenkins.NotFoundException:
            logger.warning("任务不存在", job_name=job_name)
            raise HTTPException(status_code=404, detail=f"任务 '{job_name}' 不存在")
        except jenkins.JenkinsException as e:
            logger.error("Jenkins 异常", job_name=job_name, error=str(e), error_type=type(e).__name__)
            raise HTTPException(status_code=500, detail=f"Jenkins 异常: {str(e)}")
        except Exception as e:
            logger.error("触发任务构建失败", job_name=job_name, error=str(e), error_type=type(e).__name__)
            raise
    
    def get_build_info(self, job_name: str, build_number: int) -> Dict[str, Any]:
        """获取构建详情"""
        try:
            build_info = self.server.get_build_info(job_name, build_number)
            logger.info("获取构建详情成功", job_name=job_name, build_number=build_number)
            return build_info
        except jenkins.NotFoundException:
            logger.warning("构建不存在", job_name=job_name, build_number=build_number)
            raise HTTPException(
                status_code=404,
                detail=f"任务 '{job_name}' 的构建 #{build_number} 不存在"
            )
        except Exception as e:
            logger.error("获取构建详情失败", job_name=job_name, build_number=build_number, error=str(e))
            raise
    
    def get_build_console_output(self, job_name: str, build_number: int) -> str:
        """获取构建控制台输出"""
        try:
            console_output = self.server.get_build_console_output(job_name, build_number)
            logger.info("获取构建控制台输出成功", job_name=job_name, build_number=build_number)
            return console_output
        except jenkins.NotFoundException:
            logger.warning("构建不存在", job_name=job_name, build_number=build_number)
            raise HTTPException(
                status_code=404,
                detail=f"任务 '{job_name}' 的构建 #{build_number} 不存在"
            )
        except Exception as e:
            logger.error("获取构建控制台输出失败", job_name=job_name, build_number=build_number, error=str(e))
            raise
    
    def get_queue_item(self, queue_id: int) -> Dict[str, Any]:
        """获取队列项信息"""
        try:
            queue_info = self.server.get_queue_item(queue_id)
            logger.info("获取队列项信息成功", queue_id=queue_id)
            return queue_info
        except jenkins.NotFoundException:
            logger.warning("队列项不存在", queue_id=queue_id)
            raise HTTPException(status_code=404, detail=f"队列项 {queue_id} 不存在")
        except Exception as e:
            logger.error("获取队列项信息失败", queue_id=queue_id, error=str(e))
            raise
    
    def delete_job(self, job_name: str) -> None:
        """删除任务"""
        try:
            self.server.delete_job(job_name)
            logger.info("删除任务成功", job_name=job_name)
        except Exception as e:
            logger.error("删除任务失败", job_name=job_name, error=str(e))
            raise
