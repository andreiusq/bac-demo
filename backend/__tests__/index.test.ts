import request from 'supertest';
import { app } from '../index';

describe('API Endpoints', () => {
  it('should return 200 OK for the root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
}); 