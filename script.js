// 시나리오 데이터
const scenarios = [
    {
        id: 1,
        context: "아군 방어 기지 20km 전방. 적 UAV 3기 고속 접근 중.",
        note: "적 접근 경로 10km 반경 내 민간 병원 식별됨.",
        mission: "적 UAV 3기 요격",
        targetConfidence: "98%",
        threatLevel: "심각",
        collateralDamage: "15%",
        aiRecommendation: "즉시 교전 (Engage)",
        goldenTime: 15,
        results: {
            engage: {
                outcome: "✅ 임무 성공. 적기 3기 격추.",
                damage: "❌ 민간 병원 오폭. 부수적 피해 발생. 민간인 사상자 12명.",
                insight: "AI는 15%의 위험을 '허용 가능'으로 판단했습니다. 하지만 그 15%가 현실이 되었을 때, 누가 책임을 질 것입니까? <strong>명확한 부수적 피해 허용 기준</strong>과 <strong>인간 통제 메커니즘</strong>이 필요합니다."
            },
            hold: {
                outcome: "⏱️ 골든타임 초과. 인간의 재검토가 늦었습니다.",
                damage: "❌ 아군 방어 기지 레이더 시설 손상. 작전 능력 30% 저하.",
                insight: "인간의 개입은 안전하지만, AI의 속도를 따라가지 못했습니다. 이 딜레마를 해결할 <strong>'사전 정의된 교전규칙(ROE)'</strong>이 필요합니다. 예: 부수적 피해 확률 10% 이상 시 자동 중지."
            }
        }
    },
    {
        id: 2,
        context: "해상 작전 구역. 미확인 선박 2척 고속 접근 중.",
        note: "선박 중 1척에서 민간 어선 신호 감지. 하지만 적 위장 전술 가능성 있음.",
        mission: "위협 선박 무력화",
        targetConfidence: "76%",
        threatLevel: "높음",
        collateralDamage: "35%",
        aiRecommendation: "조건부 교전 (Conditional Engage)",
        goldenTime: 15,
        results: {
            engage: {
                outcome: "⚠️ 교전 실시. 선박 2척 격침.",
                damage: "❌ 1척은 실제 민간 어선이었음. 어부 5명 사망.",
                insight: "AI의 76% 신뢰도는 <strong>24%의 오판 가능성</strong>을 의미합니다. 35%의 부수적 피해 확률은 너무 높습니다. <strong>신뢰도 임계값(예: 90% 이상)</strong>과 <strong>부수적 피해 상한선(예: 10% 이하)</strong>을 정책으로 명문화해야 합니다."
            },
            hold: {
                outcome: "✅ 교전 보류. 추가 정찰 자산 투입.",
                damage: "✅ 민간 어선 확인. 불필요한 교전 방지. 하지만 적 선박 1척은 도주 성공.",
                insight: "신중한 판단으로 민간인 피해를 방지했습니다. 하지만 적을 놓쳤습니다. <strong>AI와 인간의 협업 프로토콜</strong>이 필요합니다. 예: 신뢰도 80% 미만 시 자동으로 인간 검토 요청."
            }
        }
    },
    {
        id: 3,
        context: "도심 상공. 적 드론 편대 5기가 주요 인프라 시설로 접근 중.",
        note: "교전 시 드론 잔해가 인구 밀집 지역에 낙하할 가능성 높음.",
        mission: "적 드론 편대 격추",
        targetConfidence: "99%",
        threatLevel: "매우 심각",
        collateralDamage: "42%",
        aiRecommendation: "즉시 교전 (Engage)",
        goldenTime: 15,
        results: {
            engage: {
                outcome: "✅ 임무 성공. 적 드론 5기 전부 격추.",
                damage: "❌ 드론 잔해가 쇼핑몰에 낙하. 민간인 사상자 23명 발생.",
                insight: "AI는 '임무 성공'을 우선했지만, 42%의 부수적 피해 확률은 현실이 되었습니다. <strong>도심 작전에서는 더 엄격한 ROE</strong>가 필요합니다. 예: 인구 밀집 지역에서는 부수적 피해 5% 이상 시 교전 금지."
            },
            hold: {
                outcome: "⏱️ 교전 보류. 골든타임 초과.",
                damage: "❌ 적 드론이 발전소 공격 성공. 도심 전역 정전. 경제적 손실 막대.",
                insight: "인간의 망설임이 더 큰 피해를 초래했습니다. 하지만 이것은 <strong>인간의 실패가 아닌, 시스템의 실패</strong>입니다. <strong>사전에 정의된 명확한 기준</strong>이 있었다면, AI가 자동으로 대안(예: 비살상 무기 사용)을 제시할 수 있었을 것입니다."
            }
        }
    }
];

// 현재 상태
let currentScenarioIndex = 0;
let countdownTimer = null;
let timeLeft = 0;
let hasPlayedWarningFeedback = false;

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 시뮬레이션 시작
function startSimulation() {
    currentScenarioIndex = 0;
    loadScenario(currentScenarioIndex);
    showScreen('scenarioScreen');
}

// 시뮬레이션 재시작
function restartSimulation() {
    currentScenarioIndex = 0;
    showScreen('startScreen');
}

// 시나리오 로드
function loadScenario(index) {
    if (index >= scenarios.length) {
        showFinalScreen();
        return;
    }

    const scenario = scenarios[index];
    
    // 시나리오 정보 표시
    document.getElementById('context').textContent = scenario.context;
    document.getElementById('note').textContent = scenario.note;
    document.getElementById('mission').textContent = scenario.mission;
    
    // AI 분석 정보 표시
    document.getElementById('targetConfidence').textContent = scenario.targetConfidence;
    document.getElementById('threatLevel').textContent = scenario.threatLevel;
    document.getElementById('collateralDamage').textContent = scenario.collateralDamage;
    document.getElementById('aiRecommendation').textContent = scenario.aiRecommendation;

    // 시각화 바 업데이트
    updateMetricBars(scenario);
    
    // 카운트다운 시작
    startCountdown(scenario.goldenTime);
}

// 카운트다운 시작
function startCountdown(seconds) {
    timeLeft = seconds;
    const totalTime = seconds;
    hasPlayedWarningFeedback = false;
    updateCountdownDisplay(totalTime);
    
    // 버튼 활성화
    document.getElementById('engageBtn').disabled = false;
    document.getElementById('holdBtn').disabled = false;
    
    countdownTimer = setInterval(() => {
        timeLeft--;
        updateCountdownDisplay(totalTime);
        
        // 5초 이하부터 매 초마다 긴급 비프음 (시간 줄수록 주파수 높아짐)
        if (timeLeft > 0 && timeLeft <= 5) {
            const urgency = 6 - timeLeft; // 5초→1, 4초→2, ..., 1초→5
            playUrgentBeep(urgency);
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
        }

        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            timeoutDecision();
        }
    }, 1000);
}

// 카운트다운 표시 업데이트
function updateCountdownDisplay(totalTime) {
    const countdownEl = document.getElementById('countdown');
    const countdownBar = document.getElementById('countdownBar');
    
    countdownEl.textContent = `${timeLeft}초`;
    
    // 막대 진행률 계산 (남은 시간 비율)
    const percentage = (timeLeft / totalTime) * 100;
    if (countdownBar) {
        countdownBar.style.width = `${Math.max(0, percentage)}%`;
    }
    
    // 시간에 따라 색상 변경 (숫자 + 막대)
    if (timeLeft <= 3) {
        countdownEl.style.color = '#ef4444';
        countdownEl.style.animation = 'pulse 0.5s infinite';
        if (countdownBar) {
            countdownBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
            countdownBar.style.boxShadow = '0 0 16px rgba(239, 68, 68, 0.8)';
        }
    } else if (timeLeft <= 5) {
        countdownEl.style.color = '#f59e0b';
        countdownEl.style.animation = 'none';
        if (countdownBar) {
            countdownBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
            countdownBar.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.7)';
        }
    } else {
        countdownEl.style.color = '#10b981';
        countdownEl.style.animation = 'none';
        if (countdownBar) {
            countdownBar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
            countdownBar.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.6)';
        }
    }
}

// 의사결정
function makeDecision(choice) {
    clearInterval(countdownTimer);
    
    // 버튼 비활성화
    document.getElementById('engageBtn').disabled = true;
    document.getElementById('holdBtn').disabled = true;
    
    showResult(choice);
}

// 시간 초과
function timeoutDecision() {
    // 버튼 비활성화
    document.getElementById('engageBtn').disabled = true;
    document.getElementById('holdBtn').disabled = true;
    
    // 시간 초과는 hold와 동일한 결과
    triggerTimeoutFeedback();
    showResult('hold');
}

// 메트릭 바 업데이트
function updateMetricBars(scenario) {
    const targetStr = scenario.targetConfidence || '';
    const collateralStr = scenario.collateralDamage || '';

    const targetPercent = parseInt(targetStr, 10) || 0;
    const collateralPercent = parseInt(collateralStr, 10) || 0;

    console.log('막대 업데이트:', { targetPercent, collateralPercent });

    const targetBar = document.getElementById('targetConfidenceBar');
    const collateralBar = document.getElementById('collateralDamageBar');

    if (targetBar) {
        // 초기화 후 애니메이션 트리거
        targetBar.style.width = '0%';
        requestAnimationFrame(() => {
            setTimeout(() => {
                targetBar.style.width = `${Math.max(0, Math.min(targetPercent, 100))}%`;
                console.log('표적 식별률 막대:', targetBar.style.width);
            }, 100);
        });
    } else {
        console.error('targetConfidenceBar 요소를 찾을 수 없음');
    }

    if (collateralBar) {
        collateralBar.style.width = '0%';
        requestAnimationFrame(() => {
            setTimeout(() => {
                collateralBar.style.width = `${Math.max(0, Math.min(collateralPercent, 100))}%`;
                console.log('부수적 피해 막대:', collateralBar.style.width);
            }, 100);
        });
    } else {
        console.error('collateralDamageBar 요소를 찾을 수 없음');
    }
}

// 사운드 및 진동 피드백
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            audioContext = null;
        }
    }
    return audioContext;
}

function playBeep(frequency, durationSeconds) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + durationSeconds);
}

function playUrgentBeep(urgencyLevel) {
    // urgencyLevel: 1(덜 긴급) ~ 5(매우 긴급)
    const baseFreq = 600;
    const frequency = baseFreq + (urgencyLevel * 150); // 750Hz ~ 1350Hz
    playBeep(frequency, 0.1);
}

function triggerTimeoutFeedback() {
    // 시간 초과 시 낮은 경고음
    playBeep(300, 0.3);
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
}

// 결과 표시
function showResult(choice) {
    const scenario = scenarios[currentScenarioIndex];
    const result = scenario.results[choice];
    
    document.getElementById('resultOutcome').innerHTML = result.outcome;
    document.getElementById('resultDamage').innerHTML = result.damage;
    document.getElementById('resultInsight').innerHTML = result.insight;
    
    showScreen('resultScreen');
}

// 다음 시나리오
function nextScenario() {
    currentScenarioIndex++;
    
    if (currentScenarioIndex >= scenarios.length) {
        showFinalScreen();
    } else {
        loadScenario(currentScenarioIndex);
        showScreen('scenarioScreen');
    }
}

// 최종 화면
function showFinalScreen() {
    const resultPanel = document.querySelector('.result-panel');
    resultPanel.innerHTML = `
        <h2>🎓 시뮬레이션 완료</h2>
        <div class="result-box">
            <div class="result-section insight">
                <h3>핵심 메시지</h3>
                <p>모든 시나리오를 경험하셨습니다. 각 상황에서 <strong>"완벽한 답"</strong>은 존재하지 않았습니다.</p>
                <p>AI의 자율 판단은 빠르지만 위험하고, 인간의 개입은 안전하지만 느립니다.</p>
                <br>
                <h3>💡 정책적 결론</h3>
                <p><strong>따라서, 우리에게 필요한 것은:</strong></p>
                <ul style="text-align: left; margin: 20px auto; max-width: 600px;">
                    <li>✅ <strong>명확한 부수적 피해 허용 기준</strong> (예: 10% 이상 시 자동 중지)</li>
                    <li>✅ <strong>신뢰도 임계값 설정</strong> (예: 90% 미만 시 인간 검토)</li>
                    <li>✅ <strong>상황별 차등 ROE</strong> (도심 vs. 해상 vs. 전방)</li>
                    <li>✅ <strong>Human-in-the-Loop 프로토콜</strong> (AI와 인간의 협업 체계)</li>
                </ul>
                <br>
                <p style="font-size: 1.2em; font-weight: bold; color: #3b82f6;">
                    AI 기반 항공우주력의 진화는 기술의 발전이 아닌,<br>
                    <span style="color: #ef4444;">그 기술을 제어할 '정책과 윤리의 진화'</span>가 더 중요합니다.
                </p>
            </div>
        </div>
        <div class="button-group">
            <button class="btn btn-primary" onclick="restartSimulation()">처음부터 다시 시작</button>
        </div>
    `;
    
    showScreen('resultScreen');
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    showScreen('startScreen');
});
