const dash = require('../app');
dash.plugResources('viewMode');

const {pages, api, files} = require('../routes/endpoints');

const request = require('supertest')(dash.app);

pages.forEach( page => {
    test(`Status:200 - GET /${page}`, async () => {
        const response = await request.get('/'+page);
        expect(response.statusCode).toEqual(200);
    });
});
api.forEach( resource => {
    test(`Status:200 - GET /api/${resource}`, async () => {
        const response = await request.get('/api/'+resource);
        expect(response.statusCode).toEqual(200);
    });
});