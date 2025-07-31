from typing import Dict, List, Any, Optional
import jenkins
import structlog
from fastapi import HTTPException
from app.core.config import settings

logger = structlog.get_logger("jenkins_service")

class JenkinsService:
    """Jenkins 服务封装"""
    
    def __init__(self):
        auth_token = settings.JENKINS_API_TOKEN or settings.JENKINS_PASSWORD
        if not auth_token:
            raise ValueError("必须提供 JENKINS_PASSWORD 或 JENKINS_API_TOKEN")
        
        try:
            self.server = jenkins.Jenkins(
                    settings.JENKINS_URL, 
                    username=settings.JENKINS_USERNAME, 
                    password=settings.JENKINS_PASSWORD
                )
            logger.info("Jenkins 服务初始化成功", url=settings.JENKINS_URL)
        except Exception as e:
            logger.error("Jenkins 服务初始化失败", error=str(e))
            raise
    
    def get_server_user(self) -> str:
        """获取 Jenkins 服务器用户"""
        try:
            user = self.server.get_whoami()
            return user
        except Exception as e:
            logger.error("获取 Jenkins 服务器用户失败", error=str(e))

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
    
    def build_job(self, job_name: str, parameters: Dict[str, Any] = None) -> Optional[int]:
        """触发任务构建"""
        try:
            logger.info("开始触发任务构建", job_name=job_name, parameters=parameters)
            
            # 检查任务是否支持参数化构建
            job_info = self.get_job_info(job_name)
            properties = job_info.get('property', [])
            has_parameters = any(
                prop.get('_class') == 'hudson.model.ParametersDefinitionProperty' 
                for prop in properties
            )
            
            # 根据任务是否支持参数化构建来决定调用方式
            if has_parameters and parameters:
                logger.info("使用参数化构建", job_name=job_name, parameters=parameters)
                queue_id = self.server.build_job(job_name, parameters)
            else:
                logger.info("使用简单构建（无参数）", job_name=job_name)
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
        """获取构建控制台输出
        
        根据官方文档：get_build_console_output(name, number)
        Parameters:
            job_name – Job name, str
            build_number – Build number, str (also accepts int)
        Returns:
            Build console output, str
        """
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
    
    def wait_for_build_start(self, job_name: str, queue_id: int, timeout: int = 60) -> Optional[int]:
        """等待构建开始并返回构建号"""
        import time
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                # 检查队列状态
                queue_info = self.server.get_queue_item(queue_id)
                
                if queue_info.get('executable'):
                    build_number = queue_info['executable']['number']
                    logger.info("构建已开始", job_name=job_name, build_number=build_number)
                    return build_number
                elif queue_info.get('cancelled'):
                    logger.warning("构建被取消", job_name=job_name, queue_id=queue_id)
                    return None
                else:
                    logger.debug("构建仍在队列中", job_name=job_name, queue_id=queue_id)
                    time.sleep(2)
                    
            except Exception as e:
                logger.error("检查队列状态时出错", job_name=job_name, queue_id=queue_id, error=str(e))
                time.sleep(2)
        
        logger.warning("等待构建开始超时", job_name=job_name, queue_id=queue_id, timeout=timeout)
        return None
    
    def is_build_running(self, job_name: str, build_number: int) -> bool:
        """检查构建是否正在运行"""
        try:
            build_info = self.get_build_info(job_name, build_number)
            return build_info.get('building', False)
        except Exception as e:
            logger.error("检查构建状态失败", job_name=job_name, build_number=build_number, error=str(e))
            return False
    
    def delete_job(self, job_name: str) -> None:
        """删除任务"""
        try:
            self.server.delete_job(job_name)
            logger.info("删除任务成功", job_name=job_name)
        except Exception as e:
            logger.error("删除任务失败", job_name=job_name, error=str(e))
            raise
