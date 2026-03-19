const analyticsService = require('../services/analytics.service');

async function getSpendingOverview(req, res) {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    try {
        const overview = await analyticsService.getSpendingOverview(userId, startDate, endDate);
        return res.status(200).json({ success: true, data: overview });
    } catch (error) {
        console.error('Get spending overview error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getMonthlyTrends(req, res) {
    const userId = req.userId;
    const { months } = req.query;

    try {
        const trends = await analyticsService.getMonthlyTrends(userId, months ? parseInt(months) : 6);
        return res.status(200).json({ success: true, data: trends });
    } catch (error) {
        console.error('Get monthly trends error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTopExpenses(req, res) {
    const userId = req.userId;
    const { limit } = req.query;

    try {
        const expenses = await analyticsService.getTopExpenses(userId, limit ? parseInt(limit) : 10);
        return res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        console.error('Get top expenses error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getGroupAnalytics(req, res) {
    const userId = req.userId;

    try {
        const analytics = await analyticsService.getGroupAnalytics(userId);
        return res.status(200).json({ success: true, data: analytics });
    } catch (error) {
        console.error('Get group analytics error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getGoalsProgress(req, res) {
    const userId = req.userId;

    try {
        const progress = await analyticsService.getGoalsProgress(userId);
        return res.status(200).json({ success: true, data: progress });
    } catch (error) {
        console.error('Get goals progress error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getComparisonData(req, res) {
    const userId = req.userId;
    const { period } = req.query;

    try {
        const comparison = await analyticsService.getComparisonData(userId, period || 'month');
        return res.status(200).json({ success: true, data: comparison });
    } catch (error) {
        console.error('Get comparison data error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getDashboardStats(req, res) {
    const userId = req.userId;

    try {
        const [overview, trends, topExpenses, groupAnalytics, goalsProgress, comparison] = await Promise.all([
            analyticsService.getSpendingOverview(userId),
            analyticsService.getMonthlyTrends(userId, 6),
            analyticsService.getTopExpenses(userId, 5),
            analyticsService.getGroupAnalytics(userId),
            analyticsService.getGoalsProgress(userId),
            analyticsService.getComparisonData(userId, 'month')
        ]);

        return res.status(200).json({
            success: true,
            data: {
                overview,
                trends,
                topExpenses,
                groupAnalytics,
                goalsProgress,
                comparison
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getSpendingOverview,
    getMonthlyTrends,
    getTopExpenses,
    getGroupAnalytics,
    getGoalsProgress,
    getComparisonData,
    getDashboardStats
};
