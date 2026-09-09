const systemState = {
  currentUser: null,
  votedUsers: new Set(),
  selections: {
    president: null,
    vice: null
  },
  candidates: {
    president: {
      p1: { name: 'Lois Obeng', votes: 12 },
      p2: { name: 'Ama Serwaa', votes: 18 }
    },
    vice: {
      v1: { name: 'Kofi Owusu', votes: 10 },
      v2: { name: 'Abena Appiah', votes: 20 }
    }
  }
};

function switchTab(tabName) {
  if (tabName === 'ballot' && !systemState.currentUser) {
    showModal("Authentication Required", "Please enter your Student ID before voting.", "fa-solid fa-triangle-exclamation", "#ef4444");
    return;
  }

  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`view-${tabName}`).classList.add('active');
  
  const navIndex = tabName === 'login' ? 0 : tabName === 'ballot' ? 1 : 2;
  document.querySelectorAll('.nav-btn')[navIndex].classList.add('active');

  if (tabName === 'results') {
    renderResults();
  }
}

function handleLogin(e) {
  e.preventDefault();
  const idInput = document.getElementById('studentId').value.trim();

  if (!idInput) return;

  if (systemState.votedUsers.has(idInput)) {
    showModal("Already Voted", "This Student ID has already cast a vote in this election.", "fa-solid fa-circle-xmark", "#ef4444");
    return;
  }

  systemState.currentUser = idInput;
  document.getElementById('displayVoterId').innerText = idInput;
  
  switchTab('ballot');
}

function selectCandidate(category, id, element) {
  systemState.selections[category] = id;

  const siblings = element.parentElement.querySelectorAll('.candidate-card');
  siblings.forEach(card => card.classList.remove('selected'));
  element.classList.add('selected');
}

function handleVoteSubmit(e) {
  e.preventDefault();

  if (!systemState.selections.president || !systemState.selections.vice) {
    showModal("Incomplete Ballot", "Please select a candidate for every position before submitting.", "fa-solid fa-circle-exclamation", "#f59e0b");
    return;
  }

  systemState.candidates.president[systemState.selections.president].votes++;
  systemState.candidates.vice[systemState.selections.vice].votes++;

  systemState.votedUsers.add(systemState.currentUser);

  showModal(
    "Vote Recorded Successfully!", 
    `Your ballot for Adubia JHS SRC Election has been securely submitted.`, 
    "fa-solid fa-circle-check", 
    "#10b981"
  );

  systemState.currentUser = null;
  document.getElementById('loginForm').reset();
  
  document.querySelectorAll('.candidate-card').forEach(card => card.classList.remove('selected'));
  systemState.selections = { president: null, vice: null };
}

function renderResults() {
  let grandTotal = 0;

  ['president', 'vice'].forEach(category => {
    const container = document.getElementById(`results-${category}`);
    container.innerHTML = '';

    const candidates = systemState.candidates[category];
    let categoryTotal = 0;

    for (let id in candidates) {
      categoryTotal += candidates[id].votes;
    }

    if (category === 'president') grandTotal = categoryTotal;

    for (let id in candidates) {
      const candidate = candidates[id];
      const percentage = categoryTotal > 0 ? ((candidate.votes / categoryTotal) * 100).toFixed(1) : 0;

      const itemHTML = `
        <div class="result-item">
          <div class="result-meta">
            <span>${candidate.name}</span>
            <span>${candidate.votes} votes (${percentage}%)</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', itemHTML);
    }
  });

  document.getElementById('totalVotes').innerText = grandTotal;
}

function showModal(title, message, iconClass, iconColor) {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalMessage').innerText = message;
  
  const iconContainer = document.getElementById('modalIcon');
  iconContainer.innerHTML = `<i class="${iconClass}"></i>`;
  iconContainer.style.color = iconColor || 'var(--primary)';

  document.getElementById('statusModal').classList.add('active');
}

function closeModal() {
  document.getElementById('statusModal').classList.remove('active');
  if (!systemState.currentUser) {
    switchTab('results');
  }
}