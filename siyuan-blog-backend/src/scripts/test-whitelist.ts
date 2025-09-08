#!/usr/bin/env ts-node

/**
 * 测试笔记本白名单功能的脚本
 * 使用方法: npm run test:whitelist 或 npx ts-node src/scripts/test-whitelist.ts
 */

import { FileConfigService } from '../config/file-config.service'
import { NoteService } from '../modules/note/note.service'

async function testWhitelistFunctionality() {
  console.log('🧪 开始测试笔记本白名单功能\n')
  
  const fileConfigService = new FileConfigService()
  const noteService = new NoteService()
  
  try {
    // 1. 获取当前白名单配置
    console.log('1️⃣ 获取当前白名单配置:')
    const currentConfig = fileConfigService.getNotebookWhitelist()
    console.log('  配置:', JSON.stringify(currentConfig, null, 2))
    console.log('')
    
    // 2. 获取所有笔记本（测试过滤功能）
    console.log('2️⃣ 获取所有笔记本（将应用白名单过滤）:')
    try {
      const notebooks = await noteService.getNotebooks()
      console.log(`  找到 ${notebooks.length} 个允许的笔记本:`)
      notebooks.forEach(notebook => {
        console.log(`    - ${notebook.name} (ID: ${notebook.id})`)
      })
    } catch (error: any) {
      console.log(`  ❌ 获取笔记本失败: ${error.message}`)
    }
    console.log('')
    
    // 3. 测试白名单检查功能
    console.log('3️⃣ 测试白名单检查功能:')
    const testNotebookIds = ['test-id-1', 'test-id-2', 'example-notebook-id-1']
    testNotebookIds.forEach(id => {
      const isAllowed = fileConfigService.isNotebookAllowed(id)
      console.log(`  笔记本 ${id}: ${isAllowed ? '✅ 允许' : '❌ 禁止'}`)
    })
    console.log('')
    
    // 4. 测试配置更新功能
    console.log('4️⃣ 测试配置更新功能:')
    console.log('  模拟更新白名单配置...')
    const newConfig = {
      enabled: true,
      whitelistedNotebooks: [
        {
          id: 'test-notebook-1',
          name: '测试笔记本1',
          description: '这是一个测试笔记本'
        },
        {
          id: 'test-notebook-2', 
          name: '测试笔记本2',
          description: '这是另一个测试笔记本'
        }
      ]
    }
    
    // 备份原配置
    const originalConfig = fileConfigService.getNotebookWhitelist()
    
    // 更新配置
    fileConfigService.updateNotebookWhitelist(newConfig)
    console.log('  ✅ 配置更新成功')
    
    // 验证更新结果
    const updatedConfig = fileConfigService.getNotebookWhitelist()
    console.log('  更新后配置:', JSON.stringify(updatedConfig, null, 2))
    
    // 恢复原配置
    fileConfigService.updateNotebookWhitelist(originalConfig)
    console.log('  ✅ 已恢复原配置')
    console.log('')
    
    console.log('🎉 白名单功能测试完成！')
    
  } catch (error: any) {
    console.error('❌ 测试过程中发生错误:', error.message)
    console.error('详细错误:', error)
  }
}

// 运行测试
if (require.main === module) {
  testWhitelistFunctionality()
    .then(() => {
      console.log('\n✨ 测试脚本执行完毕')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 测试脚本执行失败:', error)
      process.exit(1)
    })
}

export { testWhitelistFunctionality }
