// admin.js — Full Dashboard Logic (No Dummy Data)

document.addEventListener('DOMContentLoaded', () => {

    // ── Live Date/Time ──────────────────────────
    const dtEl = document.getElementById('current-datetime');
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        dtEl.textContent = now.toLocaleDateString('en-US', options) + ' | ' + time;
    }
    updateDateTime();
    setInterval(updateDateTime, 60000);

    // ── Tab Switching ───────────────────────────
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const panels = document.querySelectorAll('.panel-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            panels.forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
            item.classList.add('active');
            const target = document.getElementById(item.getAttribute('data-target'));
            if (target) { target.style.display = 'flex'; target.classList.add('active'); }
        });
    });

    // ── Initial Data Load ───────────────────────
    fetchDashboardStats();
    fetchDashboardData();
    fetchUsers();
    fetchAdminListings();
});

// ═══════════════════════════════════════════════
// FETCH REAL STATS (Stat Cards + Bar Chart)
// ═══════════════════════════════════════════════
async function fetchDashboardStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const stats = await res.json();

        // ── Update Stat Cards with REAL data ──
        document.getElementById('stat-total-users').textContent = stats.total_users.toLocaleString();
        document.getElementById('stat-pending-verifications').textContent = stats.pending_users;
        document.getElementById('stat-new-listings').textContent = stats.today_listings;

        // Real context labels
        document.getElementById('stat-users-change').textContent = 
            stats.today_users > 0 ? `+${stats.today_users} today` : 'No new today';
        document.getElementById('stat-users-change').className = 
            'stat-change ' + (stats.today_users > 0 ? 'positive' : '');

        document.getElementById('stat-verify-change').textContent = 
            `${stats.verified_users} verified`;
        document.getElementById('stat-verify-change').className = 'stat-change';

        document.getElementById('stat-listings-change').textContent = 
            stats.total_listings > 0 ? `${stats.total_listings} total` : 'None yet';
        document.getElementById('stat-listings-change').className = 
            'stat-change ' + (stats.today_listings > 0 ? 'positive' : '');

        // ── Update Bar Chart with REAL daily activity ──
        updateBarChart(stats.daily_activity);

        // ── Update Growth Chart ──
        drawGrowthChart(stats.daily_activity);

    } catch (err) {
        console.error('Stats fetch error:', err);
    }
}

// ═══════════════════════════════════════════════
// UPDATE BAR CHART WITH REAL DATA
// ═══════════════════════════════════════════════
function updateBarChart(dailyActivity) {
    const chartContainer = document.getElementById('verification-chart');
    if (!chartContainer) return;

    chartContainer.innerHTML = '';

    // Find max value for scaling
    let maxVal = 1;
    dailyActivity.forEach(day => {
        const users = parseInt(day.new_users) || 0;
        const listings = parseInt(day.new_listings) || 0;
        if (users > maxVal) maxVal = users;
        if (listings > maxVal) maxVal = listings;
    });

    dailyActivity.forEach(day => {
        const users = parseInt(day.new_users) || 0;
        const listings = parseInt(day.new_listings) || 0;
        const userHeight = Math.max(5, (users / maxVal) * 100);
        const listingHeight = Math.max(5, (listings / maxVal) * 100);

        const group = document.createElement('div');
        group.className = 'chart-bar-group';
        group.innerHTML = `
            <div class="chart-bars-inner">
                <div class="chart-bar" style="height: ${userHeight}%;" data-color="blue" title="${users} users"></div>
                <div class="chart-bar" style="height: ${listingHeight}%;" data-color="gold" title="${listings} listings"></div>
            </div>
            <span class="chart-label">${day.day_name.charAt(0)}</span>
        `;
        chartContainer.appendChild(group);
    });
}

// ═══════════════════════════════════════════════
// FETCH DASHBOARD DATA (Tables)
// ═══════════════════════════════════════════════
async function fetchDashboardData() {
    try {
        const usersRes = await fetch('/api/admin/users');
        const users = await usersRes.json();

        const listingsRes = await fetch('/api/admin/listings');
        const listings = await listingsRes.json();

        // ── Populate Marketplace Overview (Right Column) ──
        const overviewBody = document.getElementById('marketplace-overview-body');
        if (overviewBody) {
            overviewBody.innerHTML = '';
            const recentListings = listings.slice(0, 4);

            if (recentListings.length === 0) {
                overviewBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">No listings yet</td></tr>';
            } else {
                recentListings.forEach(listing => {
                    let imgSrc = 'logo.png';
                    if (listing.images && listing.images.length > 0) {
                        let imgs = listing.images;
                        if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs); } catch(e) { imgs = [imgs]; } }
                        imgSrc = imgs[0];
                    }
                    const statusClass = listing.is_featured ? 'badge-active' : 'badge-pending';
                    const statusText = listing.is_featured ? 'ACTIVE' : 'PENDING';
                    const price = Number(listing.price || 0).toLocaleString();

                    overviewBody.innerHTML += `
                        <tr>
                            <td><img src="${imgSrc}" class="table-thumb" onerror="this.src='logo.png'"></td>
                            <td>${listing.title}<br><small style="color:var(--text-muted)">${listing.category}</small></td>
                            <td>$${price}</td>
                            <td><span class="badge ${statusClass}">${statusText}</span></td>
                        </tr>`;
                });
            }
        }

        // ── Populate Pending Verification Table (Middle Row) ──
        const pendingBody = document.getElementById('pending-verification-body');
        if (pendingBody) {
            pendingBody.innerHTML = '';
            const pendingUsers = users.filter(u => !u.is_verified);

            if (pendingUsers.length === 0) {
                pendingBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No pending verification requests</td></tr>';
            } else {
                pendingUsers.forEach(user => {
                    pendingBody.innerHTML += `
                        <tr>
                            <td style="color: var(--text-muted)">ID#${user.id}</td>
                            <td>${user.full_name}</td>
                            <td>${user.email}</td>
                            <td><span class="badge badge-pending">Pending</span></td>
                            <td>
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=1e293b&color=94a3b8&size=32" class="table-avatar">
                            </td>
                            <td>
                                <button class="action-btn btn-approve" onclick="toggleVerify(${user.id})">Approve</button>
                                <button class="action-btn btn-reject" onclick="alert('User flagged for review')">Reject</button>
                            </td>
                        </tr>`;
                });
            }
        }

        // ── Populate Bottom-Left Verification Summary ──
        const verBody = document.getElementById('verification-requests-body');
        if (verBody) {
            verBody.innerHTML = '';

            if (users.length === 0) {
                verBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">No users yet</td></tr>';
            } else {
                users.slice(0, 4).forEach(user => {
                    let statusClass, statusText;
                    if (user.is_verified) { statusClass = 'badge-approved'; statusText = 'Approved'; }
                    else { statusClass = 'badge-pending'; statusText = 'Pending'; }

                    verBody.innerHTML += `
                        <tr>
                            <td>${user.full_name}</td>
                            <td>${user.email.length > 15 ? user.email.substring(0, 15) + '...' : user.email}</td>
                            <td><span class="badge ${statusClass}">${statusText}</span></td>
                            <td>
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=1e293b&color=94a3b8&size=32" class="table-avatar">
                            </td>
                        </tr>`;
                });
            }
        }

    } catch (err) {
        console.error('Dashboard data fetch error:', err);
    }
}

// ═══════════════════════════════════════════════
// USERS PANEL — Full User Table
// ═══════════════════════════════════════════════
async function fetchUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:2rem;">No registered users yet</td></tr>';
            return;
        }

        users.forEach(user => {
            const statusBadge = user.is_verified 
                ? '<span class="badge badge-verified">Verified</span>' 
                : '<span class="badge badge-pending">Pending</span>';
            const actionBtn = user.is_verified
                ? `<button class="action-btn btn-revoke" onclick="toggleVerify(${user.id})">Revoke</button>`
                : `<button class="action-btn btn-approve" onclick="toggleVerify(${user.id})">Verify</button>`;
            const joined = new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            tbody.innerHTML += `
                <tr>
                    <td style="color: var(--text-muted)">#${user.id}</td>
                    <td>${user.full_name}</td>
                    <td>${user.email}</td>
                    <td>${user.province || '—'}</td>
                    <td>${statusBadge}</td>
                    <td style="color: var(--text-secondary)">${joined}</td>
                    <td>${actionBtn}</td>
                </tr>`;
        });

        // Also populate the Verification Panel
        const vBody = document.getElementById('verification-table-body');
        if (vBody) {
            vBody.innerHTML = '';
            const pendingUsers = users.filter(u => !u.is_verified);

            if (pendingUsers.length === 0) {
                vBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">All users are verified!</td></tr>';
            } else {
                pendingUsers.forEach(user => {
                    vBody.innerHTML += `
                        <tr>
                            <td style="color: var(--text-muted)">ID#${user.id}</td>
                            <td>${user.full_name}</td>
                            <td>${user.email}</td>
                            <td><span class="badge badge-pending">Pending</span></td>
                            <td>
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=1e293b&color=94a3b8&size=32" class="table-avatar">
                            </td>
                            <td>
                                <button class="action-btn btn-approve" onclick="toggleVerify(${user.id})">Approve</button>
                                <button class="action-btn btn-reject" onclick="alert('User flagged for review')">Reject</button>
                            </td>
                        </tr>`;
                });
            }
        }

    } catch (err) {
        console.error('Error fetching users:', err);
    }
}

// ═══════════════════════════════════════════════
// LISTINGS PANEL — Full Listings Table
// ═══════════════════════════════════════════════
async function fetchAdminListings() {
    try {
        const response = await fetch('/api/admin/listings');
        const listings = await response.json();
        
        const tbody = document.getElementById('listings-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (listings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:2rem;">No listings posted yet</td></tr>';
            return;
        }

        listings.forEach(listing => {
            let imgSrc = 'logo.png';
            if (listing.images && listing.images.length > 0) {
                let imgs = listing.images;
                if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs); } catch(e) { imgs = [imgs]; } }
                imgSrc = imgs[0];
            }

            const price = Number(listing.price || 0).toLocaleString();
            const statusBadge = listing.is_featured 
                ? '<span class="badge badge-featured">⭐ Featured</span>' 
                : '<span class="badge badge-pending">Standard</span>';
            const actionBtn = listing.is_featured
                ? `<button class="action-btn btn-revoke" onclick="toggleFeature(${listing.id})">Remove</button>`
                : `<button class="action-btn btn-feature" onclick="toggleFeature(${listing.id})">Feature</button>`;

            tbody.innerHTML += `
                <tr>
                    <td><img src="${imgSrc}" class="table-thumb" onerror="this.src='logo.png'"></td>
                    <td>${listing.title}</td>
                    <td style="text-transform: capitalize">${listing.category}</td>
                    <td>${listing.seller_name}</td>
                    <td>$${price}</td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>`;
        });

    } catch (err) {
        console.error('Error fetching admin listings:', err);
    }
}

// ═══════════════════════════════════════════════
// TOGGLE ACTIONS
// ═══════════════════════════════════════════════
async function toggleVerify(userId) {
    if (!confirm('Change this user\'s verification status?')) return;
    try {
        const res = await fetch(`/api/admin/users/${userId}/verify`, { method: 'POST' });
        if (res.ok) {
            fetchDashboardStats();
            fetchDashboardData();
            fetchUsers();
        } else { alert('Failed to update.'); }
    } catch (err) { console.error(err); }
}

async function toggleFeature(listingId) {
    if (!confirm('Change this listing\'s featured status?')) return;
    try {
        const res = await fetch(`/api/admin/listings/${listingId}/feature`, { method: 'POST' });
        if (res.ok) {
            fetchDashboardStats();
            fetchDashboardData();
            fetchAdminListings();
        } else { alert('Failed to update.'); }
    } catch (err) { console.error(err); }
}

// ═══════════════════════════════════════════════
// GROWTH CHART (Canvas — Real Data)
// ═══════════════════════════════════════════════
function drawGrowthChart(dailyActivity) {
    const canvas = document.getElementById('growth-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // Extract real data
    const usersData = dailyActivity.map(d => parseInt(d.new_users) || 0);
    const listingsData = dailyActivity.map(d => parseInt(d.new_listings) || 0);
    const labels = dailyActivity.map(d => d.day_name.substring(0, 3));

    const allVals = [...usersData, ...listingsData];
    const maxVal = Math.max(...allVals, 1);
    
    const padding = { top: 10, right: 10, bottom: 25, left: 30 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
        ctx.fillStyle = '#4a5568';
        ctx.font = '9px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padding.left - 5, y + 3);
    }
    
    // X-axis labels
    ctx.fillStyle = '#4a5568';
    ctx.font = '9px Inter';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
        const x = padding.left + (chartW / Math.max(labels.length - 1, 1)) * i;
        ctx.fillText(label, x, h - 5);
    });
    
    function drawLine(data, color) {
        if (data.length < 2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = padding.left + (chartW / Math.max(data.length - 1, 1)) * i;
            const y = padding.top + chartH - (val / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        
        // Gradient fill
        const lastX = padding.left + chartW;
        ctx.lineTo(lastX, padding.top + chartH);
        ctx.lineTo(padding.left, padding.top + chartH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        grad.addColorStop(0, color.replace('1)', '0.15)'));
        grad.addColorStop(1, color.replace('1)', '0)'));
        ctx.fillStyle = grad;
        ctx.fill();
    }
    
    drawLine(listingsData, 'rgba(59,130,246,1)');
    drawLine(usersData, 'rgba(16,185,129,1)');
}
