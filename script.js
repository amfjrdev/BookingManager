class OracleInterface {
    constructor() {
        this.apiUrl = 'http://localhost:3000/api';
        this.init();
    }

    init() {
        this.loadTopDrivers();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const adminBtn = document.getElementById('adminBtn');
        const modal = document.getElementById('adminModal');
        const closeBtn = document.querySelector('.close');
        const loadTablesBtn = document.getElementById('loadTablesBtn');
        const tableSelect = document.getElementById('tableSelect');

        adminBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        loadTablesBtn.addEventListener('click', () => {
            this.loadTables();
        });

        tableSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadTableData(e.target.value);
            }
        });
    }

    async loadTopDrivers() {
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const grid = document.getElementById('driversGrid');

        try {
            const response = await fetch(`${this.apiUrl}/top-drivers`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const drivers = await response.json();
            
            loading.style.display = 'none';
            
            if (drivers.length === 0) {
                error.textContent = 'No top-rated drivers found for this month.';
                error.style.display = 'block';
                return;
            }

            this.renderDrivers(drivers);
            grid.style.display = 'grid';

        } catch (err) {
            loading.style.display = 'none';
            error.textContent = `Failed to load drivers: ${err.message}`;
            error.style.display = 'block';
        }
    }

    renderDrivers(drivers) {
        const grid = document.getElementById('driversGrid');
        
        grid.innerHTML = drivers.map(driver => `
            <div class="driver-card">
                <div class="driver-name">${this.escapeHtml(driver.name)}</div>
                <div class="driver-stats">
                    <div class="stat">
                        <div class="stat-value">${driver.total_rides}</div>
                        <div class="stat-label">Total Rides</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${driver.avg_rating}</div>
                        <div class="stat-label">Avg Rating</div>
                    </div>
                </div>
                <div class="rating">
                    <span class="stars">${this.generateStars(driver.avg_rating)}</span>
                    <span>(${driver.avg_rating}/5.0)</span>
                </div>
            </div>
        `).join('');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '★'.repeat(fullStars);
        
        if (hasHalfStar) {
            stars += '☆';
        }
        
        return stars.padEnd(5, '☆');
    }

    async loadTables() {
        try {
            const response = await fetch(`${this.apiUrl}/tables`);
            const tables = await response.json();
            
            const select = document.getElementById('tableSelect');
            select.innerHTML = '<option value="">Select a table...</option>';
            
            tables.forEach(table => {
                const option = document.createElement('option');
                option.value = table.name;
                option.textContent = table.name;
                select.appendChild(option);
            });
            
            select.style.display = 'block';
        } catch (err) {
            alert(`Failed to load tables: ${err.message}`);
        }
    }

    async loadTableData(tableName) {
        const container = document.getElementById('tableData');
        container.innerHTML = '<p>Loading table data...</p>';

        try {
            const response = await fetch(`${this.apiUrl}/table/${tableName}`);
            const data = await response.json();
            
            if (data.length === 0) {
                container.innerHTML = '<p>No data found in this table.</p>';
                return;
            }

            this.renderTable(data, container);
        } catch (err) {
            container.innerHTML = `<p>Error loading table data: ${err.message}</p>`;
        }
    }

    renderTable(data, container) {
        const columns = Object.keys(data[0]);
        
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Body
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] || '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new OracleInterface();
});