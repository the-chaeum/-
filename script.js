function selectIncomeOption(option) {
    const incomeDirectInput = document.getElementById('incomeInputDirect');
    const incomeFixedInput = document.getElementById('incomeInputFixed');

    if (option === 'direct') {
        incomeDirectInput.disabled = false;
        incomeFixedInput.disabled = true;
    } else if (option === 'fixed') {
        incomeDirectInput.disabled = true;
        incomeDirectInput.value = '';  // 직접 입력 값을 초기화
        incomeFixedInput.disabled = false;
    }
}

function calculate() {
    const birthdateInput = document.getElementById('birthdate').value;
    const hospitalDays = parseInt(document.getElementById('hospitalDays').value);
    const clinicDays = parseInt(document.getElementById('clinicDays').value);
    const decisionFault = parseInt(document.getElementById('decisionFault').value);
    const injuryGrade = parseInt(document.getElementById('injuryGrade').value);
    const insuranceCost = parseInt(document.getElementById('insuranceCost').value); // 보험사 부담 치료비 항목 값
    const directPayment = parseInt(document.getElementById('directPayment').value); // 직불치료비 항목 값
    
    // 두 입력칸 중 하나를 선택해서 사용
    const directIncome = parseInt(document.getElementById('incomeInputDirect').value);
    const fixedIncome = parseInt(document.getElementById('incomeInputFixed').value);

    let monthlyIncome;
    if (!isNaN(directIncome) && directIncome > 0 && !document.getElementById('incomeInputDirect').disabled) {
        monthlyIncome = directIncome;
    } else {
        monthlyIncome = fixedIncome;
    }

    if (!birthdateInput) {
        alert("생년월일을 입력하세요.");
        return;
    }

    const birthdate = new Date(birthdateInput);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    if (today.getMonth() < birthdate.getMonth() || (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate())) {
        age--;
    }

    // 위자료 계산 (상해급수에 따른 값)
    let 위자료 = 0;
    if (injuryGrade === 9) 위자료 = 250000;
    else if (injuryGrade === 10) 위자료 = 200000;
    else if (injuryGrade === 11) 위자료 = 200000;
    else if (injuryGrade === 12) 위자료 = 150000;
    else if (injuryGrade === 13) 위자료 = 150000;
    else if (injuryGrade === 14) 위자료 = 150000;

    // 휴업손해 계산 (직접입력 선택 시와 도시일용임금 선택 시 구분)
    let 휴업손해 = 0;
    if (!document.getElementById('incomeInputDirect').disabled) {
        // 직접입력 선택 시
        휴업손해 = Math.floor((monthlyIncome / 30) * hospitalDays * 0.85);
    } else {
        // 도시일용임금 선택 시
        휴업손해 = Math.floor((3144413 / 30) * hospitalDays * 0.85);
    }

    // 향후치료비 계산 (나이에 따른 계산)
    let 향후치료비 = 0;
    if (age >= 0 && age <= 9) {
        향후치료비 = 91653 * 14;
    } else if (age >= 10 && age <= 19) {
        향후치료비 = 152250 * 14;
    } else if (age >= 20 && age <= 29) {
        향후치료비 = 143106 * 14;
    } else if (age >= 30 && age <= 39) {
        향후치료비 = 116760 * 14;
    } else if (age >= 40 && age <= 49) {
        향후치료비 = 112536 * 14;
    } else if (age >= 50 && age <= 59) {
        향후치료비 = 118382 * 14;
    } else if (age >= 60 && age <= 69) {
        향후치료비 = 132372 * 14;
    } else if (age >= 70) {
        향후치료비 = 200109 * 14;
    }

    // 기타 손해배상금 계산 (8,000원 * (통원일수 + 14))
    const 기타손해배상금 = 8000 * (clinicDays + 14);

    // 직불치료비는 입력된 값 그대로 사용
    const 계산된직불치료비 = directPayment;

    // 과실상계 계산 (위자료 + 휴업손해 + 기타 손해배상금 + 향후치료비 + 직불치료비) * (1 - 결정과실 / 100)
    const 과실상계 = (위자료 + 휴업손해 + 기타손해배상금 + 향후치료비 + 계산된직불치료비) * (1 - decisionFault / 100);

    // 치료비상계 계산 (보험사 부담 치료비 * (결정과실 / 100)) - 앞에 "-" 기호 추가
    const 치료비상계 = -Math.abs(insuranceCost * (decisionFault / 100));

    // 총 예상 합의금액 계산 (과실상계된 금액 + 치료비상계된 금액)
    const 총예상합의금액 = 과실상계 + 치료비상계;

    // 총 예상 합의금액의 20% 범위 계산
    const 최소금액 = Math.floor(총예상합의금액 * 0.8);
    const 최대금액 = Math.floor(총예상합의금액);

    // 결과 출력
    document.getElementById('result').innerHTML = `
        <h3>계산 결과</h3>
        <p>위자료: ${위자료.toLocaleString()} 원</p>
        <p>휴업손해: ${휴업손해.toLocaleString()} 원</p>
        <p>기타 손해배상금: ${기타손해배상금.toLocaleString()} 원</p>
        <p>향후치료비: ${향후치료비.toLocaleString()} 원</p>
        <p>직불치료비: ${계산된직불치료비.toLocaleString()} 원</p>
        <p>과실상계: ${과실상계.toLocaleString()} 원</p>
        <p>치료비상계: ${치료비상계.toLocaleString()} 원</p>
        <p><strong>총 예상 합의금액: ${최소금액.toLocaleString()} 원 ~ ${최대금액.toLocaleString()} 원</strong></p>
        <br>
        <p>※ 단, 보험사별 / 보험사 담당자별 사정에 따라 금액은 달라질 수 있습니다.</p>
        <p>이 프로그램의 제작자 및 저작권은 더채움 손해사정 행정사사무소에 있습니다.</p>
    `;
}
