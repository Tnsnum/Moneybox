(function() {
    "use strict";

    const addBtn = document.getElementById('addBtn');
    const createModal = document.getElementById('createModal');
    const editModal = document.getElementById('editModal');
    const menuModal = document.getElementById('menuModal');
    const transactionModal = document.getElementById('transactionModal');
    const piggyList = document.getElementById('piggyList');
    const emptyState = document.getElementById('emptyState');

    const piggyName = document.getElementById('piggyName');
    const piggyGoal = document.getElementById('piggyGoal');
    const piggyStart = document.getElementById('piggyStart');
    const piggyColor = document.getElementById('piggyColor');

    const editName = document.getElementById('editName');
    const editGoal = document.getElementById('editGoal');
    const editBalance = document.getElementById('editBalance');
    const editColor = document.getElementById('editColor');

    const transactionTitle = document.getElementById('transactionTitle');
    const transactionAmount = document.getElementById('transactionAmount');

    let piggies = [];
    let currentIndex = -1;
    let transactionMode = '';

    function fmt(v) { return Math.round(v).toLocaleString('ru-RU'); }

    function load() {
        const s = localStorage.getItem('kopilka_lite2');
        if(s) try{piggies=JSON.parse(s)}catch(e){piggies=[]}
        render();
    }
    function save() { localStorage.setItem('kopilka_lite2', JSON.stringify(piggies)); }

    function render() {
        piggyList.innerHTML = '';
        if(!piggies.length){emptyState.classList.add('show');return;}
        emptyState.classList.remove('show');
        piggies.forEach((p,i)=>{
            const pc = p.goal>0?Math.min(100,(p.balance/p.goal)*100):0;
            const el = document.createElement('div');
            el.className='piggy-item';
            el.style.borderColor = p.color;
            el.innerHTML = `
                <div class="piggy-item-left">
                    <div class="piggy-item-name">${esc(p.name)}</div>
                    <div class="piggy-item-ratio">${fmt(p.balance)} / ${fmt(p.goal)}</div>
                </div>
                <div class="piggy-item-percent">${pc.toFixed(2)}%</div>
            el.addEventListener('click',()=>openMenu(i));
            piggyList.appendChild(el);
        });
    }

    function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

    function openMenu(i) { currentIndex = i; menuModal.classList.add('open'); }

    function openTransaction(mode) {
        transactionMode = mode;
        transactionTitle.textContent = mode==='deposit'?'Пополнить':'Снять';
        transactionAmount.value = '';
        transactionModal.classList.add('open');
        setTimeout(()=>transactionAmount.focus(),100);
    }

    function confirmTransaction() {
        const amt = parseFloat(transactionAmount.value);
        if(isNaN(amt)||amt<=0) return;
        if(transactionMode==='withdraw') {
            piggies[currentIndex].balance = Math.max(0, piggies[currentIndex].balance - amt);
        } else {
            piggies[currentIndex].balance += amt;
        }
        save(); render();
        transactionModal.classList.remove('open');
    }

    function openEdit() {
        const p = piggies[currentIndex];
        editName.value = p.name;
        editGoal.value = p.goal;
        editBalance.value = p.balance;
        editColor.value = p.color;
        editModal.classList.add('open');
    }

    function saveEdit() {
        const p = piggies[currentIndex];
        p.name = editName.value.trim() || p.name;
        const g = parseFloat(editGoal.value);
        if(!isNaN(g)&&g>=0) p.goal = g;
        const b = parseFloat(editBalance.value);
        if(!isNaN(b)&&b>=0) p.balance = b;
        p.color = editColor.value;
        save(); render();
        editModal.classList.remove('open');
    }

    function deletePiggy() {
        if(currentIndex<0) return;
        piggies.splice(currentIndex,1);
        save(); render();
        menuModal.classList.remove('open');
    }

    function createPiggy() {
        const n = piggyName.value.trim();
        if(!n) return;
        const g = parseFloat(piggyGoal.value);
        const s = parseFloat(piggyStart.value);
        piggies.push({ name: n, goal: isNaN(g)||g<0?0:g, balance: isNaN(s)||s<0?0:s, color: piggyColor.value });
        save(); render(); createModal.classList.remove('open');
        piggyName.value=''; piggyGoal.value=''; piggyStart.value=''; piggyColor.value='#a855f7';
    }

    function closeAll() {
        [createModal,editModal,menuModal,transactionModal].forEach(m=>m.classList.remove('open'));
        currentIndex=-1;
    }

    addBtn.onclick = ()=>{ createModal.classList.add('open'); piggyName.focus(); };
    document.getElementById('cancelCreate').onclick = ()=>createModal.classList.remove('open');
    document.getElementById('savePiggy').onclick = createPiggy;
    document.getElementById('cancelEdit').onclick = ()=>editModal.classList.remove('open');
    document.getElementById('saveEdit').onclick = saveEdit;
    document.getElementById('menuDeposit').onclick = ()=>openTransaction('deposit');
    document.getElementById('menuWithdraw').onclick = ()=>openTransaction('withdraw');
    document.getElementById('menuEdit').onclick = openEdit;
    document.getElementById('menuDelete').onclick = deletePiggy;
    document.getElementById('menuClose').onclick = ()=>menuModal.classList.remove('open');
    document.getElementById('cancelTransaction').onclick = ()=>transactionModal.classList.remove('open');
    document.getElementById('confirmTransaction').onclick = confirmTransaction;

    document.addEventListener('keydown', e=>{
        if(e.key==='Escape') closeAll();
        if(e.key==='Enter' && createModal.classList.contains('open')) createPiggy();
        if(e.key==='Enter' && editModal.classList.contains('open')) saveEdit();
        if(e.key==='Enter' && transactionModal.classList.contains('open')) confirmTransaction();
    });

    load();
})();
