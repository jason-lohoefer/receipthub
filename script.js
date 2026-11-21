
const initial = [
    {
        id: 1,
        merchant: 'Airport Parking',
        date: '2026-11-18',
        amount: 28.00,
        category: 'Transportation',
        receipt: true
    },
    {
        id: 2,
        merchant: 'Hotel Dinner',
        date: '2026-11-18',
        amount: 42.65,
        category: 'Meals',
        receipt: true
    },
    {
        id: 3,
        merchant: 'Taxi to Client',
        date: '2026-11-19',
        amount: 24.50,
        category: 'Transportation',
        receipt: false
    },
    {
        id: 4,
        merchant: 'Coffee Shop',
        date: '2026-11-19',
        amount: 8.75,
        category: 'Meals',
        receipt: true
    }
];

let expenses = JSON.parse(localStorage.getItem('rh-expenses') || 'null') || initial;
let draft = {};
let page = 'dashboard';

const app = document.getElementById('app');

const money = n => '$' + Number(n).toFixed(2);
const total = () => expenses.reduce((s, x) => s + Number(x.amount), 0);
const missing = () => expenses.filter(x => !x.receipt).length;

function save() {
    localStorage.setItem('rh-expenses', JSON.stringify(expenses));
}

function go(p) {
    page = p;
    render();
    window.scrollTo(0, 0);
}

function header(title, sub, step) {
    return `
        <div class="step">${step}</div>
        <h1>${title}</h1>
        <p>${sub}</p>
    `;
}

function row(x) {
    return `
        <div class="row">
            <div>
                <b>${x.merchant}</b>
                <div class="muted" style="font-size:13px;margin-top:5px">
                    ${x.date} · ${x.category}
                </div>
            </div>
            <div style="text-align:right">
                <b>${money(x.amount)}</b>
                <div style="margin-top:7px">
                    <span class="tag ${x.receipt ? '' : 'warn'}">
                        ${x.receipt ? 'Receipt saved' : 'Receipt missing'}
                    </span>
                </div>
            </div>
        </div>
    `;
}

function render() {
    let h = '';

    if (page === 'dashboard') {
        h = header(
            'Your travel expenses',
            'Everything from your business trip in one place.',
            '01 · Trips dashboard'
        ) + `
            <div class="cards">
                <div class="card">
                    Trip total
                    <div class="metric">${money(total())}</div>
                </div>
                <div class="card">
                    Recorded expenses
                    <div class="metric">${expenses.length}</div>
                </div>
                <div class="card">
                    Needs attention
                    <div class="metric">${missing()}</div>
                </div>
            </div>
            <div class="panel">
                <h2>Phoenix work trip</h2>
                <p>November 18–20, 2026 · Phoenix, Arizona</p>
                <div class="hint">
                    ${missing()
                        ? `${missing()} expense(s) need a receipt before your trip is ready.`
                        : 'All recorded expenses have receipts. Ready for final review.'}
                </div>
                <button class="btn" onclick="go('trip')">Open trip →</button>
            </div>
        `;
    } else if (page === 'trip') {
        h = header(
            'Phoenix work trip',
            'Review each purchase and identify anything missing.',
            '02 · Trip expense list'
        ) + `
            <div class="actions">
                <button class="btn" onclick="go('add')">+ Add receipt or expense</button>
                <button class="btn alt" onclick="go('report')">Review report →</button>
            </div>
            <div class="panel">
                <h2>Expenses <span class="muted">(${expenses.length})</span></h2>
                ${expenses.map(row).join('')}
            </div>
            <div class="hint">
                ${missing()
                    ? `Action needed: ${missing()} expense(s) have no receipt. You can add one or continue with the missing-receipt flag.`
                    : 'No missing receipts detected among recorded expenses. Compare this list with your actual purchases before submitting.'}
            </div>
        `;
    } else if (page === 'add') {
        h = header(
            'Add an expense',
            'Capture the details while the purchase is fresh.',
            '03 · Add receipt'
        ) + `
            <div class="panel">
                <div class="receipt">
                    <b>Receipt attachment</b>
                    <p>Choose a photo or PDF (optional for this demo)</p>
                    <input type="file" id="file" accept="image/*,.pdf">
                </div>
                <div class="formgrid">
                    <div>
                        <label for="merchant">Merchant</label>
                        <input id="merchant" value="Airport Lunch">
                    </div>
                    <div>
                        <label for="amount">Amount (USD)</label>
                        <input id="amount" type="number" min="0.01" step="0.01" value="18.40">
                    </div>
                    <div>
                        <label for="date">Purchase date</label>
                        <input id="date" type="date" value="2026-11-19">
                    </div>
                    <div>
                        <label for="category">Category</label>
                        <select id="category">
                            <option>Meals</option>
                            <option>Transportation</option>
                            <option>Lodging</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div class="hint">
                    This concept demo uses editable sample fields. Automatic receipt scanning is proposed for future development, not implemented here.
                </div>
                <div class="actions">
                    <button class="btn" onclick="review()">Review details →</button>
                    <button class="btn alt" onclick="go('trip')">Cancel</button>
                </div>
            </div>
        `;
    } else if (page === 'review') {
        h = header(
            'Verify expense details',
            'Check the information before adding it to your trip.',
            '04 · Review and save'
        ) + `
            <div class="panel">
                <div class="row">
                    <b>Merchant</b>
                    <span>${esc(draft.merchant)}</span>
                </div>
                <div class="row">
                    <b>Amount</b>
                    <span>${money(draft.amount)}</span>
                </div>
                <div class="row">
                    <b>Date</b>
                    <span>${draft.date}</span>
                </div>
                <div class="row">
                    <b>Category</b>
                    <span>${draft.category}</span>
                </div>
                <div class="row">
                    <b>Receipt</b>
                    <span class="tag ${draft.receipt ? '' : 'warn'}">
                        ${draft.receipt ? 'Attached' : 'Not attached'}
                    </span>
                </div>
                <div class="actions">
                    <button class="btn" onclick="commit()">Save to trip ✓</button>
                    <button class="btn alt" onclick="go('add')">Edit details</button>
                </div>
            </div>
        `;
    } else if (page === 'report') {
        h = header(
            'Trip expense report',
            'Review your trip and prepare a file for your company expense system.',
            '05 · Review and export'
        ) + `
            <div class="cards">
                <div class="card">
                    Total
                    <div class="metric">${money(total())}</div>
                </div>
                <div class="card">
                    Expenses
                    <div class="metric">${expenses.length}</div>
                </div>
                <div class="card">
                    Missing receipts
                    <div class="metric">${missing()}</div>
                </div>
            </div>
            <div class="panel">
                <h2>Phoenix · November 18–20</h2>
                ${expenses.map(row).join('')}
                <div class="hint">
                    ${missing()
                        ? 'Some receipts are missing. Export is available with those items flagged for follow-up.'
                        : 'All recorded expenses have receipts. Confirm no purchases are missing before export.'}
                </div>
                <div class="actions">
                    <button class="btn" onclick="exportCsv()">Download CSV report ↓</button>
                    <button class="btn alt" onclick="go('trip')">Back to expenses</button>
                    <button class="btn alt" onclick="reset()">Reset sample data</button>
                </div>
            </div>
        `;
    }

    app.innerHTML = h;
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

function review() {
    let m = document.getElementById('merchant').value.trim();
    let a = Number(document.getElementById('amount').value);
    let d = document.getElementById('date').value;

    if (!m || !(a > 0) || !d) {
        alert('Enter a merchant, valid amount, and date.');
        return;
    }

    draft = {
        merchant: m,
        amount: a,
        date: d,
        category: document.getElementById('category').value,
        receipt: document.getElementById('file').files.length > 0
    };

    go('review');
}

function commit() {
    expenses.push({...draft, id: Date.now()});
    save();
    go('trip');
}

function exportCsv() {
    let lines = [
        ['Merchant', 'Date', 'Amount', 'Category', 'Receipt attached'],
        ...expenses.map(x => [
            x.merchant,
            x.date,
            x.amount,
            x.category,
            x.receipt ? 'Yes' : 'No'
        ])
    ];

    let csv = lines
        .map(r => r.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(','))
        .join('\r\n');

    let a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv'}));
    a.download = 'ReceiptHub-Phoenix-Trip.csv';
    a.click();

    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function reset() {
    if (confirm('Restore original demo expenses?')) {
        expenses = initial;
        save();
        go('dashboard');
    }
}

render();
