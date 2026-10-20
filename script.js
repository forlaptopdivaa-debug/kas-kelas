/* ==========================================================================
   KASKITA - JAVASCRIPT LOGIC
   ========================================================================== */
const STORAGE_KEY_TX = 'kaskita_transactions_v2';
const STORAGE_KEY_STUDENTS = 'kaskita_students_v2';

// 1. DATA AWAL (DEFAULT)
let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY_TX)) || [
    { id: 1, type: 'masuk', title: 'Kas Awal Semester', amount: 50000, date: '15 Okt 2026' }
];

let students = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS)) || [
    { id: 1, name: 'Andi Saputra', status: 'lunas' },
    { id: 2, name: 'Budi Santoso', status: 'lunas' },
    { id: 3, name: 'Citra Kirana', status: 'belum' }
];

// 2. FUNGSI FORMAT RUPIAH & KEAMANAN
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(number);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// 3. RENDER UI UTAMA
function renderUI() {
    renderTransactions();
    renderStudents();
}

// Render Riwayat & Saldo Transaksi
function renderTransactions() {
    const txList = document.getElementById('txList');
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const filter = filterType ? filterType.value : 'all';
    
    if (!txList) return;
    txList.innerHTML = '';

    let income = 0;
    let expense = 0;

    transactions.forEach(tx => {
        const amt = parseInt(tx.amount);
        if (tx.type === 'masuk') income += amt;
        else expense += amt;
    });

    const filteredTx = transactions.filter(tx => {
        const matchesSearch = tx.title.toLowerCase().includes(query);
        const matchesFilter = filter === 'all' || tx.type === filter;
        return matchesSearch && matchesFilter;
    });

    document.getElementById('txCount').innerText = `${filteredTx.length} Transaksi`;

    if (filteredTx.length === 0) {
        txList.innerHTML = '<div class="empty-state">Belum ada data transaksi.</div>';
    } else {
        filteredTx.forEach(tx => {
            const isMasuk = tx.type === 'masuk';
            const item = document.createElement('li');
            item.className = 'tx-item';

            item.innerHTML = `
                <div class="tx-info">
                    <div class="title">${escapeHtml(tx.title)}</div>
                    <div class="date">📅 ${tx.date}</div>
                </div>
                <div style="display:flex; align-items:center; gap:0.8rem;">
                    <span class="tx-amount ${tx.type}">
                        ${isMasuk ? '+' : '-'} ${formatRupiah(tx.amount)}
                    </span>
                    <button class="btn-delete" onclick="deleteTx(${tx.id})" title="Hapus">🗑️</button>
                </div>
            `;
            txList.appendChild(item);
        });
    }

    const balance = income - expense;
    document.getElementById('totalBalance').innerText = formatRupiah(balance);
    document.getElementById('totalIncome').innerText = formatRupiah(income);
    document.getElementById('totalExpense').innerText = formatRupiah(expense);

    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
}

// Render Daftar Status Kas Per Anak (Rp 5.000)
function renderStudents() {
    const studentList = document.getElementById('studentList');
    const studentCount = document.getElementById('studentCount');
    if (!studentList) return;

    studentList.innerHTML = '';
    studentCount.innerText = `${students.length} Siswa`;

    if (students.length === 0) {
        studentList.innerHTML = '<div class="empty-state">Belum ada daftar siswa.</div>';
        return;
    }

    students.forEach(student => {
        const item = document.createElement('li');
        item.className = 'student-item';

        const isLunas = student.status === 'lunas';
        const statusText = isLunas ? 'Lunas (Rp 5rb)' : 'Belum (Rp 5rb)';
        const badgeClass = isLunas ? 'lunas' : 'belum';

        item.innerHTML = `
            <span class="student-name">${escapeHtml(student.name)}</span>
            <div style="display:flex; align-items:center; gap:0.5rem;">
                <span class="badge-status ${badgeClass}" onclick="toggleStudentStatus(${student.id})" title="Klik untuk ubah status">
                    ${statusText}
                </span>
                <button class="btn-delete" onclick="deleteStudent(${student.id})" title="Hapus Siswa">❌</button>
            </div>
        `;
        studentList.appendChild(item);
    });

    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
}

// 4. EVENT LISTENERS FORM
document.addEventListener('DOMContentLoaded', function() {
    renderUI();

    // Submit Form Transaksi Umum
    const txForm = document.getElementById('txForm');
    if (txForm) {
        txForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const type = document.getElementById('txType').value;
            const title = document.getElementById('txTitle').value.trim();
            const amount = parseInt(document.getElementById('txAmount').value);
            const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            const newTx = { id: Date.now(), type, title, amount, date: today };
            transactions.unshift(newTx);
            
            renderTransactions();
            txForm.reset();
        });
    }

    // Submit Form Tambah Siswa Kas Rp 5000
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('studentName').value.trim();
            const status = document.getElementById('studentStatus').value;

            const newStudent = { id: Date.now(), name, status };
            students.push(newStudent);

            renderStudents();
            studentForm.reset();
        });
    }
});

// 5. MANOGEMENT AKSI & DATA
function deleteTx(id) {
    if (confirm("Hapus catatan transaksi ini?")) {
        transactions = transactions.filter(tx => tx.id !== id);
        renderTransactions();
    }
}

function deleteStudent(id) {
    if (confirm("Hapus nama siswa dari daftar?")) {
        students = students.filter(s => s.id !== id);
        renderStudents();
    }
}

// Ubah Status Lunas / Belum saat badge diklik
function toggleStudentStatus(id) {
    students = students.map(s => {
        if (s.id === id) {
            s.status = s.status === 'lunas' ? 'belum' : 'lunas';
        }
        return s;
    });
    renderStudents();
}

function shareToWhatsApp() {
    let income = 0, expense = 0;
    transactions.forEach(tx => {
        if (tx.type === 'masuk') income += parseInt(tx.amount);
        else expense += parseInt(tx.amount);
    });
    const balance = income - expense;

    let lunasCount = students.filter(s => s.status === 'lunas').length;
    let belumCount = students.length - lunasCount;

    let text = `*📢 REKAP KAS KELAS (KasKita)*\n`;
    text += `-----------------------------------\n`;
    text += `💰 *Saldo Kas Saat Ini:* ${formatRupiah(balance)}\n`;
    text += `📥 Total Pemasukan: ${formatRupiah(income)}\n`;
    text += `📤 Total Pengeluaran: ${formatRupiah(expense)}\n\n`;
    text += `👥 *Status Kas Siswa (Rp 5.000):*\n`;
    text += `✅ Sudah Lunas: ${lunasCount} siswa\n`;
    text += `❌ Belum Lunas: ${belumCount} siswa\n`;
    text += `\n_Laporan otomatis via web KasKita App._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function exportData() {
    const dataObj = { transactions, students };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kaskita_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function resetData() {
    if (confirm("⚠️ Reset semua data transaksi dan daftar siswa?")) {
        transactions = [];
        students = [];
        renderUI();
    }
}
