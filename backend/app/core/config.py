from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置"""
    
    # 应用基本信息
    APP_NAME: str = Field(default="Jenkins Admin Backend", description="应用名称")
    APP_VERSION: str = Field(default="1.0.0", description="应用版本")
    DEBUG: bool = Field(default=True, description="调试模式")
    
    # 服务器配置
    HOST: str = Field(default="0.0.0.0", description="服务器主机地址")
    PORT: int = Field(default=8000, description="服务器端口")
    
    # Jenkins 配置
    JENKINS_URL: str = Field(default="http://localhost:8080", description="Jenkins 服务器地址")
    JENKINS_USERNAME: str = Field(default="admin", description="Jenkins 用户名")
    JENKINS_PASSWORD: Optional[str] = Field(default=None, description="Jenkins 密码")
    JENKINS_API_TOKEN: Optional[str] = Field(default=None, description="Jenkins API Token")
    
    # 日志配置
    LOG_LEVEL: str = Field(default="INFO", description="日志级别")
    LOG_FORMAT: str = Field(default="console", description="日志格式")
    
    # CORS 配置
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000"],
        description="允许的 CORS 源"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()