from app.services.jenkins_service import JenkinsService

# 全局 Jenkins 服务实例
jenkins_service_instance = None

def get_jenkins_service() -> JenkinsService:
    """获取 Jenkins 服务单例"""
    global jenkins_service_instance
    if jenkins_service_instance is None:
        try:
            jenkins_service_instance = JenkinsService()
        except Exception as e:
            # 如果在启动时初始化失败，这里可以处理
            # 在健康检查中会体现出来
            pass
    
    if jenkins_service_instance is None:
         # 如果初始化失败，则无法提供服务
        raise ConnectionError("Jenkins 服务不可用，请检查配置和连接")

    return jenkins_service_instance