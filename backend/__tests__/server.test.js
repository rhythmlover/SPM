import { MySqlContainer } from '@testcontainers/mysql';
import { closeConnection } from '../mysqlConnection';
import mysql from 'mysql2/promise';
import request from 'supertest';
import app from '../server.js';

describe('Server Tests', () => {
  jest.setTimeout(60000);

  beforeAll(async () => {});

  afterAll(async () => {
    await closeConnection();
  });

  it('Test Ping', async () => {
    const response = await request(app).get('/'); // Replace with your endpoint

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Tesing Ping Success!' });
  });
});
