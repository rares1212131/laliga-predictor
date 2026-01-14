import api from '../api/api';

const matchService = {
    getFixtures: (week) => api.get(`/matches?week=${week}`),

    getMatchDetails: (id) => api.get(`/matches/${id}/details`),
    vote: (matchId, choice) => api.post('/votes', { matchId, choice }),

    getCurrentWeek: () => api.get('/matches/current-week')
};

export default matchService;