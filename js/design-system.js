document.addEventListener('DOMContentLoaded', () => {
    // 1. Smooth scrolling for sidebar navigation
    const sidebarLinks = document.querySelectorAll('.ds-sidebar a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 2. Code block copy button functionality
    const copyButtons = document.querySelectorAll('.copy-btn');

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pre = button.nextElementSibling;
            const code = pre.querySelector('code');
            const textToCopy = code.innerText;

            navigator.clipboard.writeText(textToCopy).then(() => {
                button.innerText = 'Copied!';
                setTimeout(() => {
                    button.innerText = 'Copy';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                button.innerText = 'Error';
                 setTimeout(() => {
                    button.innerText = 'Copy';
                }, 2000);
            });
        });
    });
});

   // 캘린더 렌더링 로직
    if (document.querySelector('.calendar-container')) {

        // --- [수정] ---
        // 실제 API 호출은 정적 페이지에서 동작하지 않으므로,
        // 디자인 시스템 시연을 위한 가상(dummy) 데이터를 생성합니다.
        const dummyScheduleData = {
            "9": { // 9월
                "4": "모의고사 (1, 2학년)",
                "15": "개교기념일",
                "28": "체육대회"
            },
            "10": { // 10월
                "16": "중간고사 시작",
                "24": "학부모 공개수업"
            }
        };

        async function loadScheduleData(year, month) {
            // 가상 데이터를 사용하여 API 호출을 시뮬레이션합니다.
            return new Promise(resolve => {
                setTimeout(() => { // 실제 네트워크 지연처럼 보이게 함
                    resolve(dummyScheduleData[month] || {});
                }, 200);
            });
        }
        // --- [수정 끝] ---

        const calendarGrid = document.getElementById('calendar-dates-grid');
        const scheduleList = document.getElementById('schedule-list-container');
        const monthTitle = document.getElementById('current-month-title');
        const prevBtn = document.getElementById('prev-month-btn');
        const nextBtn = document.getElementById('next-month-btn');

        let currentDate = new Date();

        async function renderCalendar() {
            calendarGrid.innerHTML = '';
            if(scheduleList) scheduleList.innerHTML = '';

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth(); // 0: 1월, 11: 12월
            
            monthTitle.textContent = `${year}년 ${month + 1}월`;
            
            const monthSchedules = await loadScheduleData(year, month + 1);

            const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0: 일요일, 6: 토요일
            const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
            const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

            for (let i = firstDayOfMonth; i > 0; i--) {
                const day = document.createElement('div');
                day.className = 'date-cell other-month';
                day.textContent = lastDateOfPrevMonth - i + 1;
                calendarGrid.appendChild(day);
            }

            const today = new Date();
            for (let i = 1; i <= lastDateOfMonth; i++) {
                const day = document.createElement('div');
                day.className = 'date-cell';
                day.textContent = i;

                if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    day.classList.add('today');
                }

                if (monthSchedules[String(i)]) {
                    day.classList.add('has-event');

                    const eventText = monthSchedules[String(i)];
                    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date(year, month, i).getDay()];

                    if(scheduleList) {
                        const scheduleItem = `
                            <div class="schedule-item">
                            <div class="schedule-date"><strong>${i.toString().padStart(2, '0')}</strong><span>${dayOfWeek}</span></div>
                            <div class="schedule-info">
                                <h4>${eventText}</h4>
                            </div>
                            </div>
                        `;
                        scheduleList.innerHTML += scheduleItem;
                    }
                }
                calendarGrid.appendChild(day);
            }

            const totalCells = firstDayOfMonth + lastDateOfMonth;
            const nextMonthDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

            for (let i = 1; i <= nextMonthDays; i++) {
                const day = document.createElement('div');
                day.className = 'date-cell other-month';
                day.textContent = i;
                calendarGrid.appendChild(day);
            }
        }

        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        renderCalendar();
    }
       if (document.querySelector('.day-selector')) {
        const daySelectors = document.querySelectorAll('.day-selector');
        
        daySelectors.forEach(selector => {
            // [수정] 탭 바로 다음에 오는 내용 컨테이너가 있는지 먼저 확인합니다.
            const contentContainer = selector.nextElementSibling;
            if (contentContainer && contentContainer.classList.contains('timetable-content')) {

                const dayTabs = selector.querySelectorAll('.day-tab');
                const schedules = contentContainer.querySelectorAll('.day-schedule');

                dayTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const targetDay = tab.dataset.day;

                        dayTabs.forEach(t => t.classList.remove('active'));
                        schedules.forEach(s => s.classList.remove('active'));

                        tab.classList.add('active');
                        const targetSchedule = Array.from(schedules).find(s => s.id === targetDay);
                        if(targetSchedule) {
                            targetSchedule.classList.add('active');
                        }
                    });
                });

                function activateCurrentDay() {
                    const today = new Date().getDay(); // 0:일, 1:월, ...
                    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    let currentDayId = dayMap[today];
                    
                    const currentTab = selector.querySelector(`.day-tab[data-day="${currentDayId}"]`);
                    if (currentTab) {
                        currentTab.click();
                    } else {
                        const firstTab = selector.querySelector('.day-tab');
                        if (firstTab) {
                            firstTab.click();
                        }
                    }
                }
                activateCurrentDay();
            }
        });
    }