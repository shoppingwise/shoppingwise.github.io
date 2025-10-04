const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ========================================
// 🎯 자동화 실행 횟수 설정
// ========================================
const AUTO_RUN_COUNT = 10; // 원하는 횟수로 변경하세요 (예: 5번 실행)

// 실행할 스크립트 목록
const scripts = [
    { name: '1.crawl.js', description: '상품 정보 크롤링' },
    { name: '2.gemini_run.js', description: 'AI 리뷰 생성' },
    { name: '3.post.js', description: '블로그 포스팅' }
];

// 색상 코드 (터미널 출력용)
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

// 스크립트 실행 함수
function runScript(scriptPath) {
    return new Promise((resolve, reject) => {
        console.log(`${colors.cyan}실행 중: ${scriptPath}${colors.reset}`);
        
        const child = spawn('node', [scriptPath], {
            cwd: __dirname,
            stdio: 'inherit', // 자식 프로세스의 출력을 현재 프로세스로 전달
            shell: true
        });

        child.on('error', (error) => {
            console.error(`${colors.red}오류 발생: ${error.message}${colors.reset}`);
            reject(error);
        });

        child.on('exit', (code) => {
            if (code === 0) {
                console.log(`${colors.green}✓ 완료: ${scriptPath}${colors.reset}\n`);
                resolve();
            } else {
                const error = new Error(`스크립트가 오류 코드 ${code}로 종료됨`);
                console.error(`${colors.red}✗ 실패: ${scriptPath} (종료 코드: ${code})${colors.reset}`);
                reject(error);
            }
        });
    });
}

// 메인 실행 함수
async function runAll() {
    console.log(`${colors.bright}${colors.cyan}========================================`);
    console.log('  네이버 쇼핑 자동 포스팅 시스템 시작');
    console.log(`  총 ${AUTO_RUN_COUNT}번 실행 예정`);
    console.log(`========================================${colors.reset}\n`);
    
    const totalStartTime = Date.now();
    
    try {
        // 환경변수 체크
        require('dotenv').config();
        const requiredEnvVars = ['POST_ID', 'POST_PASSWORD', 'GEMINI_API_KEY'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.error(`${colors.red}필수 환경변수가 설정되지 않았습니다:${colors.reset}`);
            missingVars.forEach(varName => {
                console.error(`  - ${varName}`);
            });
            console.log('\n.env 파일에 위 환경변수들을 설정해주세요.');
            process.exit(1);
        }
        
        // 설정된 횟수만큼 전체 프로세스 반복 실행
        for (let cycle = 1; cycle <= AUTO_RUN_COUNT; cycle++) {
            console.log(`${colors.bright}${colors.yellow}🔄 [${cycle}/${AUTO_RUN_COUNT}] 사이클 시작${colors.reset}`);
            console.log(`${'='.repeat(50)}\n`);
            
            const cycleStartTime = Date.now();
            
            // 각 스크립트 순차 실행
            for (let i = 0; i < scripts.length; i++) {
                const script = scripts[i];
                const scriptPath = path.join(__dirname, script.name);
                
                // 파일 존재 확인
                if (!fs.existsSync(scriptPath)) {
                    console.error(`${colors.red}파일을 찾을 수 없습니다: ${script.name}${colors.reset}`);
                    process.exit(1);
                }
                
                console.log(`${colors.yellow}[${i + 1}/${scripts.length}] ${script.description}${colors.reset}`);
                console.log('-'.repeat(40));
                
                await runScript(scriptPath);
                
                // 다음 스크립트 실행 전 잠시 대기 (마지막 스크립트 제외)
                if (i < scripts.length - 1) {
                    console.log(`다음 단계 준비 중...\n`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            
            const cycleElapsedTime = Math.round((Date.now() - cycleStartTime) / 1000);
            const cycleMinutes = Math.floor(cycleElapsedTime / 60);
            const cycleSeconds = cycleElapsedTime % 60;
            
            console.log(`${colors.green}✅ [${cycle}/${AUTO_RUN_COUNT}] 사이클 완료! (소요시간: ${cycleMinutes}분 ${cycleSeconds}초)${colors.reset}`);
            
            // 다음 사이클 실행 전 대기 (마지막 사이클 제외)
            if (cycle < AUTO_RUN_COUNT) {
                console.log(`${colors.cyan}⏳ 다음 사이클 준비 중... (10초 대기)\n${colors.reset}`);
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        }
        
        const totalElapsedTime = Math.round((Date.now() - totalStartTime) / 1000);
        const totalMinutes = Math.floor(totalElapsedTime / 60);
        const totalSeconds = totalElapsedTime % 60;
        
        console.log(`${colors.bright}${colors.green}========================================`);
        console.log('  🎉 모든 자동화 작업이 성공적으로 완료되었습니다!');
        console.log(`  총 실행 횟수: ${AUTO_RUN_COUNT}번`);
        console.log(`  총 소요 시간: ${totalMinutes}분 ${totalSeconds}초`);
        console.log(`========================================${colors.reset}\n`);
        
    } catch (error) {
        const elapsedTime = Math.round((Date.now() - totalStartTime) / 1000);
        
        console.error(`\n${colors.bright}${colors.red}========================================`);
        console.error('  작업 중 오류가 발생했습니다');
        console.error(`  오류: ${error.message}`);
        console.error(`  소요 시간: ${elapsedTime}초`);
        console.error(`========================================${colors.reset}\n`);
        
        // 오류 발생 시 정리 작업
        console.log(`${colors.yellow}정리 작업을 수행합니다...${colors.reset}`);
        try {
            // result.json이 남아있으면 삭제
            const resultPath = path.join(__dirname, 'result.json');
            if (fs.existsSync(resultPath)) {
                fs.unlinkSync(resultPath);
                console.log('- result.json 삭제 완료');
            }
            
            // imgs 폴더 정리
            const imgsDir = path.join(__dirname, 'imgs');
            if (fs.existsSync(imgsDir)) {
                const files = fs.readdirSync(imgsDir);
                for (const file of files) {
                    fs.unlinkSync(path.join(imgsDir, file));
                }
                console.log(`- imgs 폴더 정리 완료 (${files.length}개 파일 삭제)`);
            }
            
            // 동영상 파일 삭제
            const files = fs.readdirSync(__dirname);
            const videoFiles = files.filter(file => file.endsWith('_slideshow.mp4'));
            for (const videoFile of videoFiles) {
                fs.unlinkSync(path.join(__dirname, videoFile));
                console.log(`- 동영상 파일 삭제: ${videoFile}`);
            }
            
        } catch (cleanupError) {
            console.error(`정리 작업 중 오류: ${cleanupError.message}`);
        }
        
        process.exit(1);
    }
}

// 실행
console.clear(); // 터미널 클리어 (선택사항)
runAll();