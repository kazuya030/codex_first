#!/usr/bin/env node

/**
 * main.module.js自動生成スクリプト
 * main.jsからテスト用のモジュールファイルを生成する
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = '../main.js';
const OUTPUT_FILE = 'main.module.js';

/**
 * main.jsからクラス定義を抽出してmain.module.jsを生成する
 */
function generateModuleFile() {
  try {
    console.log('📖 main.jsを読み込み中...');
    const mainContent = fs.readFileSync(INPUT_FILE, 'utf8');
    
    console.log('🔍 必要な部分を抽出中...');
    
    // 抽出するパターン
    const patterns = {
      config: /const CONFIG = \{[\s\S]*?\};/,
      uiManager: /class UIManager \{[\s\S]*?\n\}/,
      simulationConfig: /class SimulationConfig \{[\s\S]*?\n\}/,
      grid: /class Grid \{[\s\S]*?\n\}/,
      agent: /class Agent \{[\s\S]*?\n\}/,
      herbivore: /class Herbivore extends Agent \{[\s\S]*?\n\}/,
      carnivore: /class Carnivore extends Agent \{[\s\S]*?\n\}/
    };
    
    const extractedSections = {};
    const exportedClasses = [];
    
    // 各セクションを抽出
    for (const [name, pattern] of Object.entries(patterns)) {
      const match = mainContent.match(pattern);
      if (match) {
        extractedSections[name] = match[0];
        if (name !== 'config') {
          // クラス名を抽出（最初の文字を大文字にする）
          const className = name.charAt(0).toUpperCase() + name.slice(1);
          if (name === 'uiManager') exportedClasses.push('UIManager');
          else if (name === 'simulationConfig') exportedClasses.push('SimulationConfig');
          else exportedClasses.push(className);
        }
        console.log(`✅ ${name} を抽出しました`);
      } else {
        console.warn(`⚠️  ${name} の抽出に失敗しました`);
      }
    }
    
    // CONFIGは常にエクスポート
    exportedClasses.unshift('CONFIG');
    
    // ファイル内容を構築
    const moduleContent = `/**
 * テスト用のモジュールエクスポート版
 * main.jsから必要なクラスを抽出してエクスポート
 * 
 * 🤖 このファイルは自動生成されています
 * generate-module.js により main.js から生成
 * 手動で編集しないでください
 */

${Object.values(extractedSections).join('\n\n')}

// Node.js環境での条件付きエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ${exportedClasses.join(',\n    ')}
  };
}
`;
    
    console.log('💾 main.module.jsを書き込み中...');
    fs.writeFileSync(OUTPUT_FILE, moduleContent, 'utf8');
    
    console.log('✨ main.module.js が正常に生成されました！');
    console.log(`📊 生成されたファイル: ${OUTPUT_FILE}`);
    console.log(`📈 エクスポートされたクラス: ${exportedClasses.join(', ')}`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// スクリプト実行時の処理
if (require.main === module) {
  console.log('🔄 main.module.js自動生成を開始...');
  generateModuleFile();
}

module.exports = { generateModuleFile };