#!/usr/bin/env python3
"""
简化版 Jenkins 构建测试
只实现触发构建 job 的功能
"""

import time
from typing import Dict, Any
from app.services.jenkins_service import JenkinsService

class SimpleBuildTest:
    """简化的构建测试"""
    
    def __init__(self):
        self.jenkins_service = JenkinsService()
    
    def trigger_build(self, job_name: str, parameters: Dict[str, Any] = None) -> int:
        """触发构建"""
        print(f"🚀 触发构建任务: {job_name}")
        
        try:
            # 检查任务是否支持参数化构建
            job_info = self.jenkins_service.get_job_info(job_name)
            properties = job_info.get('property', [])
            has_parameters = any(
                prop.get('_class') == 'hudson.model.ParametersDefinitionProperty' 
                for prop in properties
            )
            
            if has_parameters and parameters:
                print(f"   使用参数化构建，参数: {parameters}")
                queue_id = self.jenkins_service.build_job(job_name, parameters)
            else:
                print(f"   使用简单构建（无参数）")
                queue_id = self.jenkins_service.build_job(job_name)
            
            print(f"✅ 构建已触发，队列 ID: {queue_id}")
            return queue_id
            
        except Exception as e:
            print(f"❌ 触发构建失败: {str(e)}")
            return None
    
    def test_existing_job(self, job_name: str = "Test_iOS_Package"):
        """测试现有任务的构建"""
        print("🔧 测试现有任务构建")
        print("=" * 50)
        
        # 1. 检查任务是否存在
        try:
            job_info = self.jenkins_service.get_job_info(job_name)
            print(f"✅ 任务存在: {job_name}")
            print(f"   任务描述: {job_info.get('description', '无描述')}")
            print(f"   任务状态: {job_info.get('color', 'unknown')}")
            print(f"   是否可构建: {job_info.get('buildable', False)}")
            
            # 检查是否支持参数化构建
            properties = job_info.get('property', [])
            has_parameters = any(
                prop.get('_class') == 'hudson.model.ParametersDefinitionProperty' 
                for prop in properties
            )
            print(f"   支持参数化构建: {has_parameters}")
            
        except Exception as e:
            print(f"❌ 任务不存在或无法访问: {str(e)}")
            return False
        
        # 2. 触发构建（自动选择构建方式）
        queue_id = self.trigger_build(job_name)
        if queue_id is None:
            return False
        
        # 3. 等待构建开始
        build_number = self.wait_for_build_start(job_name, queue_id)
        if build_number is None:
            return False
        
        print(f"✅ 构建测试完成！构建号: {build_number}")
        return True
    
    def wait_for_build_start(self, job_name: str, queue_id: int, timeout: int = 60) -> int:
        """等待构建开始并返回构建号"""
        print(f"⏳ 等待构建开始 (队列 ID: {queue_id})...")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                # 检查队列状态
                queue_info = self.jenkins_service.server.get_queue_item(queue_id)
                
                if queue_info.get('executable'):
                    build_number = queue_info['executable']['number']
                    print(f"✅ 构建已开始，构建号: {build_number}")
                    return build_number
                elif queue_info.get('cancelled'):
                    print("❌ 构建被取消")
                    return None
                else:
                    print("   构建仍在队列中...")
                    time.sleep(2)
                    
            except Exception as e:
                print(f"   检查队列状态时出错: {str(e)}")
                time.sleep(2)
        
        print("❌ 等待构建开始超时")
        return None

def main():
    """主函数"""
    print("🚀 开始简化版构建测试")
    print("=" * 60)
    
    # 创建测试实例
    test = SimpleBuildTest()
    
    # 测试现有任务
    success = test.test_existing_job("Test_iOS_Package")
    
    if success:
        print("\n🎉 构建测试成功！")
    else:
        print("\n💥 构建测试失败！")

if __name__ == "__main__":
    main()