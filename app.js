
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STORAGE_KEY = 'flexicredit_transactions_v1';
  const GOAL_KEY = 'flexicredit_goal_v1';
  const today = new Date();
  const isoToday = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const money = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value || 0);
  const safeText = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const demoSeed = [
    {id:uid(),type:'INCOME',title:'Monthly stipend',category:'Salary',amount:18000,date:isoToday(new Date(today.getFullYear(),today.getMonth(),2)),notes:'Monthly income'},
    {id:uid(),type:'EXPENSE',title:'Groceries & essentials',category:'Food & Dining',amount:1850,date:isoToday(new Date(today.getFullYear(),today.getMonth(),4)),notes:'Weekly essentials'},
    {id:uid(),type:'EXPENSE',title:'Metro & commute',category:'Transport',amount:620,date:isoToday(new Date(today.getFullYear(),today.getMonth(),7)),notes:'Travel pass'},
    {id:uid(),type:'EXPENSE',title:'Course materials',category:'Education',amount:1250,date:isoToday(new Date(today.getFullYear(),today.getMonth(),10)),notes:'Study resources'},
    {id:uid(),type:'INCOME',title:'Freelance design',category:'Freelance',amount:3500,date:isoToday(new Date(today.getFullYear(),today.getMonth(),12)),notes:'Small project'},
    {id:uid(),type:'EXPENSE',title:'Streaming subscription',category:'Bills & Utilities',amount:299,date:isoToday(new Date(today.getFullYear(),today.getMonth(),15)),notes:'Monthly plan'}
  ];
  let transactions = loadTransactions();
  let goal = loadGoal();
  let currentView = 'dashboard';
  let toastTimer;
  function loadTransactions() {
    try { const raw=localStorage.getItem(STORAGE_KEY); if(raw!==null) return JSON.parse(raw).filter(validTransaction); }
    catch(e) { console.warn('Could not load saved transactions',e); }
    return demoSeed;
  }
  function validTransaction(t){return t && typeof t.id==='string' && ['INCOME','EXPENSE'].includes(t.type) && typeof t.title==='string' && Number.isFinite(Number(t.amount)) && Number(t.amount)>0;}
  function saveTransactions(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(transactions));}catch(e){showToast('Browser storage is unavailable. Changes may not persist.');}}
  function loadGoal(){try{return JSON.parse(localStorage.getItem(GOAL_KEY))||{name:'Emergency fund',target:50000};}catch{return {name:'Emergency fund',target:50000};}}
  function saveGoal(){try{localStorage.setItem(GOAL_KEY,JSON.stringify(goal));}catch(e){showToast('Could not save goal in this browser.');}}
  function showToast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800);}
  function totals(items=transactions){return items.reduce((a,t)=>{a[t.type==='INCOME'?'income':'expense']+=Number(t.amount);return a;},{income:0,expense:0});}
  function categoryIcon(category){return ({'Food & Dining':'⌂','Transport':'↗','Shopping':'◇','Bills & Utilities':'▤','Education':'▣','Health':'✚','Salary':'↙','Freelance':'✦','Investment':'◒','Other':'•'})[category]||'•';}
  function setView(view){
    currentView=view;
    document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===`${view}View`));
    document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
    $('pageName').textContent=({dashboard:'Overview',transactions:'Transactions',insights:'Insights'})[view]||'Overview';
    $('sidebar').classList.remove('open'); renderAll();
  }
  function renderAll(){renderStats();renderChart();renderCategories();renderRecent();renderTransactions();renderCategoryFilter();renderInsights();renderGoal();}
  function renderStats(){
    const {income,expense}=totals();const net=income-expense;const rate=income>0?Math.max(0,net/income*100):0;
    $('balanceValue').textContent=money(net);$('incomeValue').textContent=money(income);$('expenseValue').textContent=money(expense);$('savingsValue').textContent=`${Math.round(rate)}%`;
    $('savingsStatus').textContent=income===0?'Add income to begin':rate>=20?'Great saving habit':rate>0?'Keep building':'Review your spending';
  }
  function renderChart(){
    const canvas=$('cashflowChart'),ctx=canvas.getContext('2d'),range=$('chartRange').value;
    const items=transactions.filter(t=>range==='all'||(today-new Date(`${t.date}T00:00:00`))/(86400000)<=Number(range));
    const groups=[];
    if(range==='7'||range==='30'){
      const days=Number(range)===7?7:6;
      for(let i=days;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);const key=isoToday(d);groups.push({key,label:d.toLocaleDateString('en-IN',{day:'numeric',month:'short'}),income:0,expense:0});}
    } else {
      const months={};items.forEach(t=>{const d=new Date(`${t.date}T00:00:00`),key=`${d.getFullYear()}-${d.getMonth()}`;if(!months[key])months[key]={key,label:d.toLocaleDateString('en-IN',{month:'short'}),income:0,expense:0};months[key][t.type==='INCOME'?'income':'expense']+=Number(t.amount);});
      groups.push(...Object.values(months).sort((a,b)=>a.key.localeCompare(b.key)).slice(-6));
      if(!groups.length)for(let i=5;i>=0;i--){const d=new Date(today.getFullYear(),today.getMonth()-i,1);groups.push({key:'',label:d.toLocaleDateString('en-IN',{month:'short'}),income:0,expense:0});}
    }
    groups.forEach(g=>items.filter(t=>t.date===g.key).forEach(t=>g[t.type==='INCOME'?'income':'expense']+=Number(t.amount)));
    const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;canvas.width=Math.max(1,rect.width*dpr);canvas.height=Math.max(1,rect.height*dpr);ctx.scale(dpr,dpr);
    const w=rect.width,h=rect.height;ctx.clearRect(0,0,w,h);const pad={l:8,r:8,t:12,b:25},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
    const max=Math.max(1,...groups.flatMap(g=>[g.income,g.expense]))*1.15;
    ctx.font='10px DM Sans';ctx.textAlign='left';ctx.fillStyle='#a0ada7';
    for(let i=0;i<4;i++){const y=pad.t+ch*i/3;ctx.strokeStyle='#edf2ef';ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();}
    const slot=cw/Math.max(groups.length,1),bw=Math.min(14,slot*.27);
    groups.forEach((g,i)=>{const center=pad.l+slot*(i+.5);const ih=g.income/max*ch,eh=g.expense/max*ch;ctx.fillStyle='#16866e';roundRect(ctx,center-bw-2,pad.t+ch-ih,bw,ih,4);ctx.fillStyle='#f19a87';roundRect(ctx,center+2,pad.t+ch-eh,bw,eh,4);ctx.fillStyle='#99a7a0';ctx.textAlign='center';ctx.fillText(g.label,center,h-6);});
    $('chartEmpty').classList.toggle('hidden',transactions.length>0);
  }
  function roundRect(ctx,x,y,w,h,r){if(h<=0)return;ctx.beginPath();ctx.roundRect(x,y,Math.max(1,w),Math.max(2,h),Math.min(r,w/2,h/2));ctx.fill();}
  function renderCategories(){
    const expenses=transactions.filter(t=>t.type==='EXPENSE'),map={};expenses.forEach(t=>map[t.category]=(map[t.category]||0)+Number(t.amount));
    const sorted=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5),total=expenses.reduce((s,t)=>s+Number(t.amount),0);
    $('categoryBreakdown').innerHTML=sorted.length?sorted.map(([name,amount])=>`<div class="category-item"><div class="category-icon">${categoryIcon(name)}</div><div class="category-meta"><strong>${safeText(name)}</strong><div class="category-bar"><span style="width:${total?amount/Math.max(...sorted.map(x=>x[1]))*100:0}%"></span></div></div><span class="category-amount">${money(amount)}</span></div>`).join(''):'<div class="empty-state"><div class="empty-icon">◒</div><strong>No spending data yet</strong><p>Your category breakdown will appear here.</p></div>';
  }
  function rowMarkup(t,full=false){
    const income=t.type==='INCOME',sign=income?'+':'−';
    return `<tr><td><div class="transaction-name"><span class="transaction-symbol">${categoryIcon(t.category)}</span><div><strong>${safeText(t.title)}</strong><small>${safeText(t.notes|| (income?'Money received':'Money spent'))}</small></div></div></td><td><span class="type-pill ${income?'':'expense'}">${safeText(t.category)}</span></td><td>${new Date(`${t.date}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>${full?`<td>${safeText(t.notes||'—')}</td>`:''}<td class="${income?'amount-positive':'amount-negative'}">${sign} ${money(Number(t.amount))}</td><td>${full?`<button class="edit-button" data-edit="${safeText(t.id)}">Edit</button><button class="delete-button" data-delete="${safeText(t.id)}">Delete</button>`:''}</td></tr>`;
  }
  function renderRecent(){
    const items=[...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
    $('recentRows').innerHTML=items.map(t=>rowMarkup(t)).join('');$('recentEmpty').classList.toggle('hidden',items.length>0);
    $('recentRows').closest('table').classList.toggle('hidden',items.length===0);
  }
  function renderTransactions(){
    const q=$('searchInput').value.trim().toLowerCase(),type=$('typeFilter').value,cat=$('categoryFilter').value;
    const items=[...transactions].filter(t=>(type==='ALL'||t.type===type)&&(cat==='ALL'||t.category===cat)&&(!q||[t.title,t.category,t.notes,t.date].join(' ').toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date));
    $('allRows').innerHTML=items.map(t=>rowMarkup(t,true)).join('');$('allEmpty').classList.toggle('hidden',items.length>0);$('allRows').closest('table').classList.toggle('hidden',items.length===0);
  }
  function renderCategoryFilter(){
    const select=$('categoryFilter'),previous=select.value,categories=[...new Set(transactions.map(t=>t.category))].sort();
    select.innerHTML='<option value="ALL">All categories</option>'+categories.map(c=>`<option value="${safeText(c)}">${safeText(c)}</option>`).join('');
    select.value=categories.includes(previous)?previous:'ALL';
  }
  function renderInsights(){
    const {income,expense}=totals(),net=income-expense,rate=income?net/income*100:0;
    $('insightNet').textContent=money(net);
    const byCat={};transactions.filter(t=>t.type==='EXPENSE').forEach(t=>byCat[t.category]=(byCat[t.category]||0)+Number(t.amount));
    const top=Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
    const insights=[
      ['✦','Your savings snapshot',income===0?'Add an income entry to calculate your savings rate.':`You have retained ${Math.max(0,rate).toFixed(1)}% of recorded income after expenses.`],
      ['⌂','Biggest spending category',top?`${top[0]} is your largest recorded expense category at ${money(top[1])}.`:'No expense category is available yet.'],
      ['◎','A gentle reminder',net<0?'Expenses are higher than income. Review entries and consider a spending plan.':net===0?'Your net cash flow is currently zero. Keep tracking to spot patterns.':'Keep recording transactions regularly to make these insights more useful.']
    ];
    $('insightList').innerHTML=insights.map(([emoji,title,body])=>`<div class="insight-row"><div class="insight-emoji">${emoji}</div><div><strong>${title}</strong><p>${body}</p></div></div>`).join('');
  }
  function renderGoal(){
    const {income,expense}=totals(),saved=Math.max(0,income-expense),target=Math.max(0,Number(goal.target)||0),pct=target?Math.min(100,saved/target*100):0;
    $('goalName').textContent=goal.name||'Savings goal';$('goalMeta').textContent=target?'Keep going, every rupee counts':'Set a target to start tracking';
    $('goalAmount').textContent=`${money(saved)} / ${money(target)}`;$('goalProgress').style.width=`${pct}%`;$('goalPercent').textContent=`${Math.round(pct)}% completed`;
    $('goalRemaining').textContent=target?`${money(Math.max(0,target-saved))} to go`:'Set your goal amount';
  }
  function openModal(id){$(id).classList.remove('hidden');document.body.style.overflow='hidden';}
  function closeModal(id){$(id).classList.add('hidden');document.body.style.overflow='';}
  function resetTransactionForm(){ $('transactionForm').reset();$('editId').value='';$('transactionType').value='EXPENSE';document.querySelectorAll('.type-option').forEach(b=>b.classList.toggle('selected',b.dataset.type==='EXPENSE'));$('dateInput').value=isoToday(today);$('modalTitle').textContent='Add transaction';$('saveTransactionBtn').innerHTML='Save transaction <span>→</span>';$('formError').classList.add('hidden'); }
  function openTransaction(id=null){
    resetTransactionForm();
    if(id){const t=transactions.find(x=>x.id===id);if(!t)return;$('editId').value=t.id;$('transactionType').value=t.type;$('titleInput').value=t.title;$('amountInput').value=t.amount;$('categoryInput').value=t.category;$('dateInput').value=t.date;$('notesInput').value=t.notes||'';$('modalTitle').textContent='Edit transaction';$('saveTransactionBtn').innerHTML='Update transaction <span>→</span>';document.querySelectorAll('.type-option').forEach(b=>b.classList.toggle('selected',b.dataset.type===t.type));}
    openModal('transactionModal');setTimeout(()=>$('titleInput').focus(),80);
  }
  function csvEscape(v){return `"${String(v??'').replace(/"/g,'""')}"`;}
  function exportCSV(){
    const rows=[['id','type','title','category','amount','transaction_date','notes'],...transactions.map(t=>[t.id,t.type,t.title,t.category,Number(t.amount).toFixed(2),t.date,t.notes||''])];
    const blob=new Blob([rows.map(r=>r.map(csvEscape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='flexicredit-transactions.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast('CSV export prepared.');
  }
  document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.goto)));
  ['addTopBtn','addTransactionsBtn','emptyAddBtn'].forEach(id=>$(id).addEventListener('click',()=>openTransaction()));
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
  document.querySelectorAll('.modal-backdrop').forEach(b=>b.addEventListener('click',e=>{if(e.target===b)closeModal(b.id);}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(m=>closeModal(m.id));});
  document.querySelectorAll('.type-option').forEach(b=>b.addEventListener('click',()=>{$('transactionType').value=b.dataset.type;document.querySelectorAll('.type-option').forEach(x=>x.classList.toggle('selected',x===b));}));
  $('transactionForm').addEventListener('submit',e=>{
    e.preventDefault();const type=$('transactionType').value,title=$('titleInput').value.trim(),amount=Number($('amountInput').value),category=$('categoryInput').value,date=$('dateInput').value,notes=$('notesInput').value.trim(),id=$('editId').value;
    const err=$('formError');err.classList.add('hidden');
    if(!title||!category||!date||!Number.isFinite(amount)||amount<=0){err.textContent='Please enter a title, valid positive amount, category and date.';err.classList.remove('hidden');return;}
    if(title.length>100||notes.length>255){err.textContent='Please shorten the title or notes to the allowed length.';err.classList.remove('hidden');return;}
    const record={id:id||uid(),type,title,amount:Math.round(amount*100)/100,category,date,notes};
    if(id){transactions=transactions.map(t=>t.id===id?record:t);showToast('Transaction updated successfully.');}
    else{transactions.push(record);showToast(`${type==='INCOME'?'Income':'Expense'} added successfully.`);}
    saveTransactions();closeModal('transactionModal');renderAll();
  });
  $('allRows').addEventListener('click',e=>{
    const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');
    if(edit)openTransaction(edit.dataset.edit);
    if(del){const t=transactions.find(x=>x.id===del.dataset.delete);if(t&&confirm(`Delete "${t.title}"? This cannot be undone.`)){transactions=transactions.filter(x=>x.id!==t.id);saveTransactions();renderAll();showToast('Transaction deleted.');}}
  });
  ['searchInput','typeFilter','categoryFilter'].forEach(id=>$(id).addEventListener(id==='searchInput'?'input':'change',renderTransactions));
  $('chartRange').addEventListener('change',renderChart);window.addEventListener('resize',()=>{if(currentView==='dashboard')renderChart();});
  $('exportBtn').addEventListener('click',exportCSV);
  $('emailForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const address=$('emailAddress').value.trim(),note=$('emailNote').value.trim();
    if(!address || !$('emailAddress').checkValidity()){showToast('Please enter a valid email address.');return;}
    const {income,expense}=totals(),net=income-expense;
    const categoryTotals={};transactions.filter(t=>t.type==='EXPENSE').forEach(t=>categoryTotals[t.category]=(categoryTotals[t.category]||0)+Number(t.amount));
    const top=Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1])[0];
    const report={
      to:address,
      note,
      income:money(income),
      expenses:money(expense),
      net:money(net),
      savingsGoal:`${goal.name} (${money(goal.target)})`,
      topExpense:top?`${top[0]} — ${money(top[1])}`:'No expenses recorded'
    };
    const submitButton=$('emailForm').querySelector('button[type="submit"]');
    submitButton.disabled=true;
    try{
      const response=await fetch('/api/send-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(result.error||'Could not send the email.');
      showToast('Finance report sent successfully.');
    }catch(error){
      showToast(error.message||'Email failed. Check server and SMTP settings.');
    }finally{submitButton.disabled=false;}
  });
  function openGoal(){ $('goalNameInput').value=goal.name||'Emergency fund';$('goalTargetInput').value=goal.target||'';openModal('goalModal');}
  $('goalBtn').addEventListener('click',openGoal);$('editGoalBtn').addEventListener('click',openGoal);
  $('goalForm').addEventListener('submit',e=>{e.preventDefault();const name=$('goalNameInput').value.trim(),target=Number($('goalTargetInput').value);if(!name||!Number.isFinite(target)||target<=0){showToast('Enter a goal name and positive target amount.');return;}goal={name,target};saveGoal();closeModal('goalModal');renderGoal();showToast('Savings goal saved.');});
  $('mobileMenu').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
  $('helpBtn').addEventListener('click',()=>alert('FlexiCredit is a frontend learning demo. Add income and expenses, filter and edit transactions, export CSV, and set a savings goal. Data stays in this browser; no email or banking service is connected.'));
  $('todayLabel').textContent=today.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  $('greeting').textContent=`Good ${today.getHours()<12?'morning':today.getHours()<17?'afternoon':'evening'} 👋`;
  // Seed sample entries on first launch so charts and tables can be explored immediately.
  if(localStorage.getItem(STORAGE_KEY)===null)saveTransactions();
  renderAll();
})();