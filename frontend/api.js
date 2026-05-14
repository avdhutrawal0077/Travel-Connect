document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = 'http://127.0.0.1:5000/api';

    // Helper: get fetch headers
    function getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // ── Polling logic for Rides ──
    const feedScroll = document.querySelector('.feed-scroll');
    async function loadRides() {
        if (!feedScroll) return;
        try {
            let url = API_BASE + '/rides/';
            const pickup = document.getElementById('routeFromInput')?.value;
            const dropoff = document.getElementById('routeToInput')?.value;
            if (pickup || dropoff) {
                url += `?pickup=${encodeURIComponent(pickup || '')}&dropoff=${encodeURIComponent(dropoff || '')}`;
            }
            let res = await fetch(url, { headers: getHeaders() });
            if (res.ok) {
                let rides = await res.json();
                feedScroll.innerHTML = '';
                rides.forEach(ride => {
                    let card = document.createElement('article');
                    card.className = 'post-card visible';
                    
                    const isBike = ride.seats <= 2;
                    const seatsNum = isBike ? 1 : 4;
                    const vehicleSvg = isBike 
                        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3.2-6H6m12 6.5l-2-7h-3l1 7" /></svg>`
                        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="10" rx="2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M5 8l2-4h10l2 4" /></svg>`;
                    const initials = ride.driver_name ? ride.driver_name.split(' ').map(n=>n.charAt(0)).join('').substring(0,2) : 'U';

                    card.innerHTML = `
                        <div class="glass-overlay"></div>
                        <header class="post-header">
                            <div class="avatar-container">
                                <div class="avatar">
                                    <span class="avatar-initials">${initials}</span>
                                </div>
                            </div>
                            <div class="user-info">
                                <span class="user-name">${ride.driver_name}</span>
                            </div>
                        </header>
                        <div class="route-strip">
                            <div class="route-collapsed">
                                <div class="route-label">
                                    <span class="route-from">${ride.pickup}</span>
                                    <span class="route-dot">•</span>
                                    <span class="route-to">${ride.dropoff}</span>
                                </div>
                            </div>
                        </div>
                        <div class="time-strip">
                            <div class="time-point departure">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span class="time-label">Departs</span>
                                <span class="time-value">${ride.time}</span>
                            </div>
                        </div>
                        <div class="transport-section single-mode">
                            <div class="mode-display">
                                <div class="mode-icon-badge ${isBike ? 'bike' : 'car'}">
                                    ${vehicleSvg}
                                    <span>${isBike ? 'Bike' : 'Car'}</span>
                                </div>
                            </div>
                            <div class="transport-footer">
                                <div class="register-wrapper" style="display:flex; gap:10px;">
                                    <button class="register-btn" onclick="bookRide(${ride.id})">
                                        <span class="btn-text register-text">Register</span>
                                    </button>
                                    <button class="register-btn" style="background:var(--surface); border:1px solid var(--border);" onclick="startChat(${ride.driver_id}, '${ride.driver_name}')">
                                        <span class="btn-text register-text" style="color:var(--text)">Message</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    feedScroll.appendChild(card);
                });
            }
        } catch(e) {
            console.error('Failed to load rides:', e);
        }
    }

    window.bookRide = async function(rideId) {
        if (!confirm('Do you want to book this ride?')) return;
        try {
            let res = await fetch(API_BASE + '/rides/book', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ ride_id: rideId })
            });
            let data = await res.json();
            alert(data.message);
            loadRides();
        } catch(e) {
            console.error(e);
        }
    };

    window.startChat = function(driverId, driverName) {
        document.querySelector('.sidebar-nav-item[data-tab="chat"]').click();
        window.currentChatUserId = driverId;
        window.currentChatUserName = driverName;
        document.getElementById('chatUserHeader').style.display = 'flex';
        document.getElementById('chatEmptyHeader').style.display = 'none';
        document.querySelector('.chat-user-name').textContent = driverName;
        document.getElementById('messagesEmptyState').style.display = 'none';
        loadChat();
    };

    async function loadBookedRides() {
        try {
            let res = await fetch(API_BASE + '/rides/my-bookings', { headers: getHeaders() });
            if (res.ok) {
                let bookings = await res.json();
                const bookedList = document.getElementById('bookedFeedScroll');
                const emptyState = document.getElementById('bookedEmptyState');
                const countEl = document.getElementById('bookedRidesCount');
                if (!bookedList) return;
                
                bookedList.innerHTML = '';
                if (bookings.length === 0) {
                    if (emptyState) emptyState.style.display = 'flex';
                    if (countEl) countEl.textContent = '0 rides';
                    return;
                }
                
                if (emptyState) emptyState.style.display = 'none';
                if (countEl) countEl.textContent = `${bookings.length} ride${bookings.length !== 1 ? 's' : ''}`;
                
                bookings.forEach(b => {
                    let card = document.createElement('article');
                    card.className = 'post-card visible';
                    const initials = b.driver_name ? b.driver_name.split(' ').map(n=>n.charAt(0)).join('').substring(0,2) : 'U';
                    card.innerHTML = `
                        <div class="glass-overlay"></div>
                        <header class="post-header">
                            <div class="avatar-container">
                                <div class="avatar">
                                    <span class="avatar-initials">${initials}</span>
                                </div>
                            </div>
                            <div class="user-info">
                                <span class="user-name">${b.driver_name}</span>
                            </div>
                        </header>
                        <div class="route-strip">
                            <div class="route-collapsed">
                                <div class="route-label">
                                    <span class="route-from">${b.pickup}</span>
                                    <span class="route-dot">•</span>
                                    <span class="route-to">${b.dropoff}</span>
                                </div>
                            </div>
                        </div>
                        <div class="time-strip">
                            <div class="time-point departure">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span class="time-label">${b.date}</span>
                                <span class="time-value">${b.time}</span>
                            </div>
                        </div>
                        <div class="transport-section single-mode">
                            <div class="transport-footer">
                                <div class="register-wrapper" style="display:flex; gap:10px;">
                                    <span class="btn-text" style="padding:8px 16px; background:var(--accent); border-radius:8px; color:#fff;">Status: ${b.status}</span>
                                </div>
                            </div>
                        </div>
                    `;
                    bookedList.appendChild(card);
                });
            }
        } catch(e) {
            console.error('Error fetching booked rides:', e);
        }
    }

    const routeSearchBtn = document.getElementById('routeSearchBtn');
    if (routeSearchBtn) {
        routeSearchBtn.addEventListener('click', loadRides);
    }

    // Periodically override the feed to show DB info rather than mock
    setInterval(() => {
        if (document.getElementById('page-home') && document.getElementById('page-home').classList.contains('active')) {
            loadRides();
        }
        if (document.getElementById('page-booked') && document.getElementById('page-booked').classList.contains('active')) {
            loadBookedRides();
        }
    }, 5000);
    // Load immediately if user is on home
    setTimeout(() => {
        loadRides();
        loadBookedRides();
    }, 2000);

    // ── Create Post Interception ──
    const postBtn = document.getElementById('publishPostBtn');
    const directPostBtn = document.getElementById('postDirectPublishBtn');
    
    const submitPost = async (e) => {
        if (e) e.preventDefault();
        const pickup = document.getElementById('postPickup').value;
        const dropoff = document.getElementById('postDestination').value;
        const date = new Date().toISOString().split('T')[0]; // Using current date
        const time = document.getElementById('postDepartTime').value;
        const vehicle = document.querySelector('.vehicle-option.active') ? document.querySelector('.vehicle-option.active').getAttribute('data-vehicle') : 'bike';
        const seats = vehicle === 'car' ? 4 : 1;

        try {
            let res = await fetch(API_BASE + '/rides/', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ pickup, dropoff, date, time, seats })
            });
            if (res.ok) {
                alert('Ride published to real database!');
                loadRides();
                
                // Switch back to home
                document.querySelector('[data-tab="home"]').click();
            }
        } catch(error) {
            console.error(error);
        }
    };

    if (postBtn) postBtn.addEventListener('click', submitPost);
    if (directPostBtn) directPostBtn.addEventListener('click', submitPost);

    // ── Chat Interception ──
    const chatMessages = document.getElementById('chatMessages');
    const msgInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const inboxList = document.getElementById('inboxList');

    window.currentChatUserId = null;
    window.currentChatUserName = '';

    async function loadInbox() {
        if (!inboxList) return;
        try {
            let res = await fetch(API_BASE + '/chat/inbox', { headers: getHeaders() });
            if (res.ok) {
                let convos = await res.json();
                if (convos.length > 0) {
                    const emptyState = document.getElementById('inboxEmptyState');
                    if (emptyState) emptyState.style.display = 'none';
                    
                    Array.from(inboxList.children).forEach(child => {
                        if (child.id !== 'inboxEmptyState') child.remove();
                    });

                    convos.forEach(c => {
                        let div = document.createElement('div');
                        div.className = 'inbox-item';
                        div.innerHTML = `
                            <div class="inbox-avatar"><span class="avatar-initials">${c.user_name.substring(0,2).toUpperCase()}</span></div>
                            <div class="inbox-details">
                                <span class="inbox-name">${c.user_name}</span>
                                <span class="inbox-preview">${c.latest_message}</span>
                            </div>
                        `;
                        div.onclick = () => {
                            window.currentChatUserId = c.user_id;
                            window.currentChatUserName = c.user_name;
                            document.getElementById('chatUserHeader').style.display = 'flex';
                            document.getElementById('chatEmptyHeader').style.display = 'none';
                            document.querySelector('.chat-user-name').textContent = c.user_name;
                            document.getElementById('messagesEmptyState').style.display = 'none';
                            loadChat();
                        };
                        inboxList.appendChild(div);
                    });
                }
            }
        } catch(e) {
            console.error(e);
        }
    }

    async function loadChat() {
        if (!chatMessages) return;
        if (!window.currentChatUserId) return;
        try {
            let res = await fetch(API_BASE + '/chat/?user_id=' + window.currentChatUserId, { headers: getHeaders() });
            if (res.ok) {
                let msgs = await res.json();
                const emptyState = document.getElementById('messagesEmptyState');
                if (emptyState && msgs.length > 0) emptyState.style.display = 'none';
                
                Array.from(chatMessages.children).forEach(child => {
                    if (child.id !== 'messagesEmptyState') child.remove();
                });
                
                msgs.forEach(msg => {
                    let div = document.createElement('div');
                    div.className = `message ${msg.is_me ? 'sent' : 'received'}`;
                    div.innerHTML = `<div class="message-bubble">${msg.content}</div>`;
                    chatMessages.appendChild(div);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } catch(e) {
            console.error(e);
        }
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', async (e) => {
            let val = msgInput.value;
            if (!val || !window.currentChatUserId) return;
            try {
                let res = await fetch(API_BASE + '/chat/', {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ content: val, receiver_id: window.currentChatUserId })
                });
                if (res.ok) {
                    msgInput.value = '';
                    loadChat();
                    loadInbox();
                }
            } catch(err) {
                console.error(err);
            }
        });
    }

    setInterval(() => {
        if (document.getElementById('page-chat') && document.getElementById('page-chat').classList.contains('active')) {
            loadInbox();
            if (window.currentChatUserId) {
                loadChat();
            }
        }
    }, 3000);

    const newChatBtn = document.querySelector('.new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', async () => {
            const identifier = prompt("Enter User ID or Phone Number to start a chat:");
            if (!identifier) return;
            
            try {
                let res = await fetch(API_BASE + '/chat/resolve_user/' + encodeURIComponent(identifier), {
                    headers: getHeaders()
                });
                let data = await res.json();
                if (res.ok) {
                    window.startChat(data.user_id, data.full_name);
                } else {
                    alert(data.message || 'User not found');
                }
            } catch (err) {
                console.error(err);
                alert('Error looking up user');
            }
        });
    }

});
