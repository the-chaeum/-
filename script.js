function selectIncomeOption(option) {
    const incomeDirectInput = document.getElementById('incomeInputDirect');

    if (option === 'direct') {
        incomeDirectInput.disabled = false; // 직접입력을 선택하면 입력란 활성화
    } else if (option === 'fixed') {
        incomeDirectInput.disabled = true; // 도시일용임금을 선택하면 입력란 비활성화
        incomeDirectInput.value = ''; // 값 초기화
    }
}

function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function removeCommas(value) {
    return value.replace(/,/g, '');
}

// 숫자 입력 시 자동으로 쉼표 단위 구분 적용
document.getElementById('insuranceCost').addEventListener('input', function (e) {
    const value = removeCommas(e.target.value);
    e.target.value = formatNumber(value);
});

document.getElementById('incomeInputDirect').addEventListener('input', function (e) {
    const value = removeCommas(e.target.value);
    e.target.value = formatNumber(value);
    document.getElementById('incomeInputDirect').disabled = false; // 입력 시 활성화 유지
});

document.getElementById('directPayment').addEventListener('input', function (e) {
    const value = removeCommas(e.target.value);
    e.target.value = formatNumber(value);
});

function calculate() {
    const birthdateInput = document.getElementById('birthdate').value;
    const hospitalDays = parseInt(document.getElementById('hospitalDays').value);
    const clinicDays = parseInt(document.getElementById('clinicDays').value);
    const userFault = parseInt(document.getElementById('userFault').value);
    const injuryGrade = parseInt(document.getElementById('injuryGrade').value);

    const insuranceCost = parseInt(removeCommas(document.getElementById('insuranceCost').value)) || 0;
    const directPayment = parseInt(removeCommas(document.getElementById('directPayment').value)) || 0;

    const directIncome = parseInt(removeCommas(document.getElementById('incomeInputDirect').value)) || 0;
    let monthlyIncome;

    if (!document.getElementById('incomeInputDirect').disabled) {
        if (!isNaN(directIncome) && directIncome > 0) {
            monthlyIncome = directIncome;
        }
    } else {
        monthlyIncome = 3144413; // 도시일용임금 값
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

    let 위자료 = 0;
    if (injuryGrade === 8) 위자료 = 300000;
    else if (injuryGrade === 9) 위자료 = 250000;
    else if (injuryGrade === 10) 위자료 = 200000;
    else if (injuryGrade === 11) 위자료 = 200000;
    else if (injuryGrade === 12) 위자료 = 150000;
    else if (injuryGrade === 13) 위자료 = 150000;
    else if (injuryGrade === 14) 위자료 = 150000;

    let 휴업손해 = 0;
    if (!document.getElementById('incomeInputDirect').disabled) {
        휴업손해 = Math.floor((monthlyIncome / 30) * hospitalDays * 0.85);
    } else {
        휴업손해 = Math.floor((3144413 / 30) * hospitalDays * 0.85);
    }

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

    const 기타손해배상금 = 8000 * (clinicDays + 14);
    const 계산된직불치료비 = directPayment;

    const 과실상계 = (위자료 + 휴업손해 + 기타손해배상금 + 향후치료비 + 계산된직불치료비) * (1 - userFault / 100);
    const 치료비상계 = -Math.abs(insuranceCost * (userFault / 100));

    const 총예상합의금액 = 과실상계 + 치료비상계;

    // 만원 단위 이하 절사
    const 최소금액 = Math.floor(Math.floor(총예상합의금액 * 0.8) / 10000) * 10000;
    const 최대금액 = Math.floor(Math.floor(총예상합의금액) / 10000) * 10000;

    document.getElementById('result').innerHTML = `
        <p><strong>총 예상 합의금액: ${최소금액.toLocaleString()} 원 ~ ${최대금액.toLocaleString()} 원</strong></p>
        <br>
        <p>※ 단, 보험사별 / 보험사 담당자별 사정에 따라 금액은 달라질 수 있습니다.</p>
        <p>이 프로그램의 제작자 및 저작권은 더채움 손해사정 행정사사무소에 있습니다.</p>
    `;
}
