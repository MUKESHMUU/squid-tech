import { escapeHtml } from '../ui.js';

export function renderLeaderboard(container, data = [], highlightId = null) {
    if (!container) return;
    container.innerHTML = '';
    const frag = document.createDocumentFragment();

    // Create table
    const table = document.createElement('table');
    table.className = 'leaderboard-table';

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Rank', 'Name', 'Score', 'Avg Reaction Time'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    data.forEach((item, idx) => {
        const row = document.createElement('tr');
        if (item.id && highlightId && item.id === highlightId) row.classList.add('highlight');

        // Rank cell
        const rankCell = document.createElement('td');
        rankCell.className = 'leader-rank';
        rankCell.textContent = String(idx + 1);
        row.appendChild(rankCell);

        // Name cell
        const nameCell = document.createElement('td');
        nameCell.className = 'leader-name';
        nameCell.textContent = escapeHtml(item.name || 'Anonymous');
        row.appendChild(nameCell);

        // Score cell
        const scoreCell = document.createElement('td');
        scoreCell.className = 'leader-score';
        scoreCell.textContent = String(item.score || 0);
        row.appendChild(scoreCell);

        // Reaction time cell
        const timeCell = document.createElement('td');
        timeCell.className = 'leader-time';
        timeCell.textContent = item.reactionTime != null ? `${(item.reactionTime).toFixed(2)}s` : '-';
        row.appendChild(timeCell);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    frag.appendChild(table);

    container.appendChild(frag);
}
