import { MySqlContainer } from '@testcontainers/mysql';
import { closeConnection } from '../mysqlConnection';
import mysql from 'mysql2/promise';
import request from 'supertest';
import app from '../server.js';

describe('Server Tests', () => {
  jest.setTimeout(60000);

  afterAll(async () => {
    await closeConnection();
  });

  it('Test Ping', async () => {
    try {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Testing Ping Success!' });
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  })
});
