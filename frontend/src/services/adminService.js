import api from '../api/api';

const adminService = {
    getMatchesByWeek: (week) => api.get(`/admin/matches?matchweek=${week}`),
    
    updateMatchResult: (id, homeGoals, awayGoals) => 
        api.put(`/admin/matches/${id}/result`, { homeGoals, awayGoals }),
    checkPredictions: (targetWeek) => 
        api.get(`/admin/ai/check-predictions?targetWeek=${targetWeek}`),

    triggerAI: (lastWeek) => 
        api.post(`/admin/ai/predict?lastCompletedWeek=${lastWeek}`),

    getUsers: () => api.get('/admin/users'),
    updateUserRoles: (id, roles) => api.put(`/admin/users/${id}/roles`, roles),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getPerformance: () => api.get('/performance') 
};

export default adminService;