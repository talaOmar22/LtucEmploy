document.addEventListener('DOMContentLoaded', init);

let employees = [];
const form = document.getElementById('employeeForm');
const tableBody = document.querySelector('#employeeTable tbody');
const totalCountInfo = document.getElementById('totalCount');
const noDataMsg = document.getElementById('noData');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

function init() {
    loadData();
    renderTable();

    form.addEventListener('submit', handleFormSubmit);
}

function loadData() {
    const storedData = localStorage.getItem('ltuc_employees');
    if (storedData) {
        employees = JSON.parse(storedData);
    }
}

function saveData() {
    localStorage.setItem('ltuc_employees', JSON.stringify(employees));
    renderTable();
}

function handleFormSubmit(e) {
    e.preventDefault();

    const editingId = document.getElementById('editingId').value;
    const id = document.getElementById('employeeId').value;
    const name = document.getElementById('fullName').value;
    const age = document.getElementById('age').value;
    const address = document.getElementById('address').value;

    // Check for duplicate ID if we are creating a new employee or changing ID (though ID change is disabled in edit)
    if (!editingId && employees.some(emp => emp.id === id)) {
        alert('Error: Employee ID already exists!');
        return;
    }

    if (editingId) {
        // Update existing
        const index = employees.findIndex(emp => emp.id === editingId);
        if (index !== -1) {
            employees[index] = { ...employees[index], name, age, address }; // createdId kept same
        }
    } else {
        // Create new
        const newEmployee = {
            id,
            name,
            age,
            address,
            createdAt: new Date().toISOString()
        };
        employees.push(newEmployee);
    }

    saveData();
    resetForm();
}

function renderTable() {
    tableBody.innerHTML = '';

    if (employees.length === 0) {
        noDataMsg.classList.remove('hidden');
        totalCountInfo.innerText = '0 Employees';
        return;
    }

    noDataMsg.classList.add('hidden');
    totalCountInfo.innerText = `${employees.length} Employee${employees.length !== 1 ? 's' : ''}`;

    employees.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span style="font-family: monospace; color: #718096">#${emp.id.substr(-6)}</span></td>
            <td><strong>${emp.name}</strong></td>
            <td>${emp.age}</td>
            <td>${emp.address}</td>
            <td>
                <div class="form-actions" style="justify-content: flex-start;">
                    <button class="action-btn edit-btn" onclick="editEmployee('${emp.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteEmployee('${emp.id}')" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}



function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        employees = employees.filter(emp => emp.id !== id);
        saveData();

        // If we are currently editing the deleted item, reset the form
        const currentEditId = document.getElementById('employeeId').value;
        if (currentEditId === id) {
            resetForm();
        }
    }
}

window.editEmployee = function (id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    document.getElementById('editingId').value = emp.id;
    document.getElementById('employeeId').value = emp.id;
    document.getElementById('employeeId').disabled = true; // Disable ID edit
    document.getElementById('fullName').value = emp.name;
    document.getElementById('age').value = emp.age;
    document.getElementById('address').value = emp.address;

    submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Update Employee';
    cancelBtn.classList.remove('hidden');

    // Smooth scroll to form on mobile/smaller screens
    if (window.innerWidth <= 768) {
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }
};

window.deleteEmployee = deleteEmployee;

window.resetForm = function () {
    form.reset();
    document.getElementById('editingId').value = '';
    document.getElementById('employeeId').disabled = false; // Re-enable ID for new entries
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Employee';
    cancelBtn.classList.add('hidden');
};
