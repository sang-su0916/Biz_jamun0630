// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // AOS 애니메이션 초기화 - 로드맵 최적화
    AOS.init({
        duration: 600,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50,
        delay: 0,
        disable: window.innerWidth < 768 ? false : false, // 모바일에서도 활성화
        startEvent: 'DOMContentLoaded',
        throttleDelay: 99,
        debounceDelay: 50,
        anchorPlacement: 'top-bottom'
    });
    
    // 로드맵 섹션 특별 처리
    setTimeout(() => {
        const roadmapElements = document.querySelectorAll('#roadmap [data-aos]');
        roadmapElements.forEach((el, index) => {
            el.style.transition = 'all 0.6s ease';
        });
    }, 100);

    // 네비게이션 기능
    initNavigation();
    
    // 통계 카운터 애니메이션
    initStatCounters();
    
    // 차트 생성
    createCharts();
    
    // 스크롤 효과
    initScrollEffects();
    
    // 모바일 메뉴
    initMobileMenu();
});

// 성능 최적화를 위한 throttle 함수 추가
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 네비게이션 초기화 - 개선된 버전
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    let isScrolling = false;
    
    // 스크롤 시 네비게이션 스타일 변경 - throttle 적용
    const handleScroll = throttle(function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 16); // 60fps
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 부드러운 스크롤 - 로드맵 최적화 버전
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // 이미 스크롤 중이면 중단
            if (isScrolling) return;
            
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target && targetId) {
                isScrolling = true;
                
                // 네비게이션 높이 동적 계산
                const navHeight = navbar ? navbar.getBoundingClientRect().height : 80;
                
                // 로드맵 섹션 특별 처리
                let offsetAdjustment = 30;
                if (targetId === '#roadmap') {
                    offsetAdjustment = 50; // 로드맵 섹션에 더 많은 여백
                }
                
                // 현재 스크롤 위치에서 타겟까지의 거리 계산
                const targetTop = target.offsetTop;
                const finalPosition = targetTop - navHeight - offsetAdjustment;
                
                // 스크롤 애니메이션 실행
                const startPosition = window.pageYOffset;
                const distance = finalPosition - startPosition;
                const duration = Math.min(800, Math.abs(distance) * 0.5); // 거리에 따른 동적 duration
                
                let startTime = null;
                
                function scrollAnimation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const progress = Math.min(timeElapsed / duration, 1);
                    
                    // easeInOutCubic 이징 함수
                    const ease = progress < 0.5 
                        ? 4 * progress * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                    
                    window.scrollTo(0, startPosition + (distance * ease));
                    
                    if (progress < 1) {
                        requestAnimationFrame(scrollAnimation);
                    } else {
                        isScrolling = false;
                        
                        // 최종 위치 미세 조정
                        setTimeout(() => {
                            const finalCheck = target.offsetTop - navHeight - offsetAdjustment;
                            if (Math.abs(window.pageYOffset - finalCheck) > 5) {
                                window.scrollTo(0, finalCheck);
                            }
                        }, 50);
                    }
                }
                
                requestAnimationFrame(scrollAnimation);
                
                // 모바일 메뉴가 열려있다면 닫기
                const navMenu = document.querySelector('.nav-menu');
                const navToggle = document.querySelector('.nav-toggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    });
}

// 통계 카운터 애니메이션
function initStatCounters() {
    function animateCounter(element, target, suffix = '') {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + suffix;
        }, 20);
    }

    // 히어로 섹션 통계 애니메이션
    const statNumbers = document.querySelectorAll('.stat-number');
    const heroSection = document.querySelector('.hero');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    animateCounter(stat, target);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    if (heroSection) {
        observer.observe(heroSection);
    }
}

// 차트 생성
function createCharts() {
    createComparisonChart();
}

// 비교 차트 생성
function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['업무 처리 시간', '오류율', '고객 만족도', '수익성', '경쟁력'],
            datasets: [{
                label: 'AI 도입 전',
                data: [100, 15, 70, 100, 60],
                backgroundColor: 'rgba(100, 116, 139, 0.8)',
                borderColor: 'rgba(100, 116, 139, 1)',
                borderWidth: 2,
                borderRadius: 12
            }, {
                label: 'AI 도입 후',
                data: [25, 2, 95, 250, 180],
                backgroundColor: 'rgba(6, 182, 212, 0.8)',
                borderColor: 'rgba(6, 182, 212, 1)',
                borderWidth: 2,
                borderRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 22, 40, 0.9)',
                    titleColor: '#06b6d4',
                    bodyColor: 'white',
                    borderColor: '#06b6d4',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.parsed.y;
                            
                            switch(context.dataIndex) {
                                case 0: // 업무 처리 시간
                                    return label + value + '%';
                                case 1: // 오류율
                                    return label + value + '%';
                                case 2: // 고객 만족도
                                    return label + value + '점';
                                case 3: // 수익성
                                    return label + value + '%';
                                case 4: // 경쟁력
                                    return label + value + '%';
                                default:
                                    return label + value;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 300,
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutCubic'
            }
        }
    });
}

// 스크롤 효과 초기화 - 개선된 버전
function initScrollEffects() {
    // 섹션 활성화 표시
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    // IntersectionObserver 설정 최적화
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // 네비게이션 링크 활성화
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '-100px 0px -100px 0px'
    });
    
    sections.forEach(section => observer.observe(section));
    
    // 패럴랙스 효과 - throttle 적용 및 최적화
    const parallaxHandler = throttle(function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-background');
        
        parallaxElements.forEach(element => {
            const speed = 0.3; // 속도 조정
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }, 16);
    
    window.addEventListener('scroll', parallaxHandler, { passive: true });
}

// 모바일 메뉴 초기화
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // 메뉴 아이템 클릭 시 메뉴 닫기
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// 컨설팅 신청 함수
function startConsultation() {
    // 실제 환경에서는 컨설팅 신청 폼이나 연락처 정보로 연결
    const message = `안녕하세요! AI 경영자문 도입에 관심이 있어서 연락드립니다.

다음 정보에 대해 상담받고 싶습니다:
• AI 도입 현황 분석
• 맞춤형 솔루션 제안
• 투자 비용 및 ROI 계산
• 단계별 도입 계획

연락처: [귀하의 연락처]
업체명: [업체명]
주요 업무: [노무/세무/회계 등]`;

    // 임시로 alert 사용 (실제로는 연락 폼이나 이메일 발송)
    if (confirm('무료 컨설팅을 신청하시겠습니까?\n\n확인을 누르시면 연락처 정보 입력 페이지로 이동합니다.')) {
        // 실제 환경에서는 컨설팅 신청 페이지로 이동
        alert('컨설팅 신청이 접수되었습니다.\n담당자가 24시간 내에 연락드리겠습니다.');
    }
}

// 가이드북 다운로드 함수
function downloadGuide() {
    // 실제 환경에서는 PDF 파일 다운로드
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`
AI 경영자문 도입 가이드북

목차:
1. AI 도입 필요성 분석
2. 업무 영역별 AI 활용 방안
3. 단계별 도입 전략
4. 투자 비용 및 ROI 분석
5. 성공 사례 및 베스트 프랙티스
6. 도입 체크리스트

이 가이드북은 중소기업 경영자문 전문가들이 AI를 성공적으로 도입하기 위한 실무 중심의 가이드입니다.

문의: AI 경영자문 가이드
이메일: info@ai-consulting-guide.com
전화: 02-1234-5678
`);
    link.download = 'AI_경영자문_도입_가이드북.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 다운로드 완료 메시지
    setTimeout(() => {
        alert('가이드북 다운로드가 완료되었습니다!\n\n더 자세한 정보가 필요하시면 무료 컨설팅을 신청해 주세요.');
    }, 500);
}

// 키보드 네비게이션 - 개선된 버전
document.addEventListener('keydown', function(e) {
    // 입력 필드에서는 키보드 네비게이션 비활성화
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    const sections = document.querySelectorAll('section[id]');
    const navbar = document.querySelector('.navbar');
    const navHeight = navbar ? navbar.offsetHeight : 0;
    let currentSection = 0;
    
    // 현재 보이는 섹션 찾기
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= navHeight + 100 && rect.bottom >= navHeight + 100) {
            currentSection = index;
        }
    });
    
    function scrollToSection(sectionIndex) {
        if (sections[sectionIndex]) {
            const target = sections[sectionIndex];
            const targetRect = target.getBoundingClientRect();
            const currentScroll = window.pageYOffset;
            const targetOffset = currentScroll + targetRect.top - navHeight - 30;
            
            window.scrollTo({
                top: targetOffset,
                behavior: 'smooth'
            });
        }
    }
    
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
            e.preventDefault();
            if (currentSection < sections.length - 1) {
                scrollToSection(currentSection + 1);
            }
            break;
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            if (currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
            break;
        case 'Home':
            e.preventDefault();
            scrollToSection(0);
            break;
        case 'End':
            e.preventDefault();
            scrollToSection(sections.length - 1);
            break;
    }
});

// 터치 제스처 지원 - 개선된 버전
let touchStartY = 0;
let touchEndY = 0;
let touchStartTime = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
    touchStartTime = Date.now();
}, { passive: true });

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    const touchDuration = Date.now() - touchStartTime;
    
    // 터치 시간이 너무 길면 무시 (드래그 구분)
    if (touchDuration < 300) {
        handleSwipe();
    }
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 80;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        const sections = document.querySelectorAll('section[id]');
        const navbar = document.querySelector('.navbar');
        const navHeight = navbar ? navbar.offsetHeight : 0;
        let currentSection = 0;
        
        // 현재 섹션 찾기
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= navHeight + 100 && rect.bottom >= navHeight + 100) {
                currentSection = index;
            }
        });
        
        function scrollToSection(sectionIndex) {
            if (sections[sectionIndex]) {
                const target = sections[sectionIndex];
                const targetRect = target.getBoundingClientRect();
                const currentScroll = window.pageYOffset;
                const targetOffset = currentScroll + targetRect.top - navHeight - 30;
                
                window.scrollTo({
                    top: targetOffset,
                    behavior: 'smooth'
                });
            }
        }
        
        if (diff > 0 && currentSection < sections.length - 1) {
            // 위로 스와이프 - 다음 섹션
            scrollToSection(currentSection + 1);
        } else if (diff < 0 && currentSection > 0) {
            // 아래로 스와이프 - 이전 섹션
            scrollToSection(currentSection - 1);
        }
    }
}

// 페이지 로드 성능 최적화
window.addEventListener('load', function() {
    // 이미지 레이지 로딩
    const images = document.querySelectorAll('img[data-src]');
    if (images.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
    
    // 페이지 로드 완료 후 추가 애니메이션
    document.body.classList.add('loaded');
});

// 접근성 개선
document.addEventListener('DOMContentLoaded', function() {
    // 포커스 관리
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #d4af37';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // 스킵 링크 추가 (접근성)
    const skipLink = document.createElement('a');
    skipLink.href = '#hero';
    skipLink.textContent = '본문으로 바로가기';
    skipLink.className = 'sr-only';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #1a2332;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 9999;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
});

// 브라우저 호환성 체크 및 폴백
function checkBrowserSupport() {
    const features = {
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        customProperties: CSS.supports('--test', 'value'),
        backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)')
    };
    
    if (!features.flexbox || !features.grid) {
        console.warn('일부 브라우저에서 레이아웃이 제대로 표시되지 않을 수 있습니다.');
        document.body.classList.add('legacy-browser');
    }
    
    if (!features.backdropFilter) {
        // backdrop-filter 미지원 시 대체 스타일 적용
        const glassmorphElements = document.querySelectorAll('.navbar, .stat-card, .benefit-card');
        glassmorphElements.forEach(element => {
            element.style.backgroundColor = 'rgba(26, 35, 50, 0.9)';
        });
    }
}

// 초기화 실행
checkBrowserSupport();

// 디버그 모드 (개발 시에만 사용)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('AI 경영자문 가이드 웹사이트 로드 완료');
    console.log('브라우저 지원 기능:', {
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        customProperties: CSS.supports('--test', 'value'),
        backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)')
    });
}