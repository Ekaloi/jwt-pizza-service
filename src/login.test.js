const request = require('supertest');
const app = require('jwt-pizza-service/src/service.js');
const { DB, Role } = require('./database/database.js');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let adminUser;
let adminUserAuthToken;


async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = "adminGuy";
  user.email = user.name + '@admin.com';

  await DB.addUser(user);
  user.password = 'toomanysecrets';

  return user;
}

async function createFranchiseeUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Franchisee }] };
  user.name = "franchiseGuy";
  user.email = user.name + '@franchise.com';

  await DB.addUser(user);
  user.password = 'toomanysecrets';

  return user;
}


beforeAll(async () => {
  adminUser = await createAdminUser();
  loginRes = await request(app).put('/api/auth').send(adminUser);
  adminUserAuthToken = loginRes.body.token;
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(loginRes.body.user).toMatchObject(user);
});

test('logout', async () => {
  const logoutRes = await request(app).delete('/api/auth').set('Authorization', `Bearer ${testUserAuthToken}`);
  expect(logoutRes.status).toBe(200);
  expect(logoutRes.body.message).toBe('logout successful');
});

test('franchise', async () => {
    const franchiseName = Math.random().toString(36).substring(2, 12) + 'diner'
    const createFranchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminUserAuthToken}`).set('Content-Type', 'application/json').send({ name: franchiseName, admins: [{ email: adminUser.email }] });
    expect(createFranchiseRes.status).toBe(200);
    const  franchiseId  = createFranchiseRes.body.id;
    console.log('franchiseId', franchiseId);

    const createFranchiseStoreRes = await request(app).post(`/api/franchise/${franchiseId}/store`).set('Authorization', `Bearer ${adminUserAuthToken}`).set('Content-Type', 'application/json').send({ name: franchiseName + 'store' });
    expect(createFranchiseStoreRes.status).toBe(200);
    const storeId = createFranchiseStoreRes.body.id;

    const getFranchiseRes = await request(app).get(`/api/franchise/${franchiseId}`).set('Authorization', `Bearer ${adminUserAuthToken}`);
    expect(getFranchiseRes.status).toBe(200);

    const getAllFranchisesRes = await request(app).get('/api/franchise').set('Authorization', `Bearer ${adminUserAuthToken}`);
    expect(getAllFranchisesRes.status).toBe(200);

    const deleteFranchiseStoreRes = await request(app).delete(`/api/franchise/${franchiseId}/store/${storeId}`).set('Authorization', `Bearer ${adminUserAuthToken}`);
    expect(deleteFranchiseStoreRes.status).toBe(200);

    const deleteFranchiseRes = await request(app).delete(`/api/franchise/${franchiseId}`).set('Authorization', `Bearer ${adminUserAuthToken}`);
    expect(deleteFranchiseRes.status).toBe(200);
  });


  
  



