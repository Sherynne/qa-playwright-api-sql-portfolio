const { test, expect } = require('@playwright/test');

const JSON_HEADERS = { Accept: 'application/json' };

const newBooking = (overrides = {}) => ({
  firstname: `Nicole${Date.now()}`,
  lastname: 'Nyagah',
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
  additionalneeds: 'Breakfast',
  ...overrides,
});

async function getToken(request) {
  const res = await request.post('/auth', {
    headers: JSON_HEADERS,
    data: { username: 'admin', password: 'password123' },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.token).toBeTruthy();
  return body.token;
}

async function createBooking(request, overrides) {
  const payload = newBooking(overrides);
  const res = await request.post('/booking', { headers: JSON_HEADERS, data: payload });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return { id: body.bookingid, payload, body };
}

test.describe('Auth', () => {
  test('valid credentials return a token', async ({ request }) => {
    const token = await getToken(request);
    expect(typeof token).toBe('string');
  });

  test('invalid credentials do not return a token', async ({ request }) => {
    const res = await request.post('/auth', {
      headers: JSON_HEADERS,
      data: { username: 'admin', password: 'wrong-password' },
    });
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toBeDefined();
  });
});

test.describe('Bookings', () => {
  let token;
  let createdIds;

  test.beforeEach(async ({ request }) => {
    token = await getToken(request);
    createdIds = [];
  });

  test.afterEach(async ({ request }) => {
    for (const id of createdIds) {
      await request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
    }
  });

  test('create: returns an id and echoes the data sent', async ({ request }) => {
    const { id, payload, body } = await createBooking(request);
    createdIds.push(id);
    expect(id).toBeGreaterThan(0);
    expect(body.booking.firstname).toBe(payload.firstname);
    expect(body.booking.totalprice).toBe(payload.totalprice);
    expect(body.booking.bookingdates).toEqual(payload.bookingdates);
  });

  // Data-driven negative tests: one test is generated per invalid payload
  const invalidPayloads = [
    { name: 'missing firstname', build: () => { const b = newBooking(); delete b.firstname; return b; } },
    { name: 'missing bookingdates', build: () => { const b = newBooking(); delete b.bookingdates; return b; } },
    { name: 'empty body', build: () => ({}) },
  ];

  for (const { name, build } of invalidPayloads) {
    test(`create: rejects payload with ${name}`, async ({ request }) => {
      const res = await request.post('/booking', { headers: JSON_HEADERS, data: build() });
      // A well-behaved API returns 400 for bad input. This one returns 500,
      // which is worth reporting as a defect. The test only requires an error status.
      expect(res.status()).toBeGreaterThanOrEqual(400);
    });
  }

  test('read: get by id returns the booking created', async ({ request }) => {
    const { id, payload } = await createBooking(request);
    createdIds.push(id);
    const res = await request.get(`/booking/${id}`, { headers: JSON_HEADERS });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.firstname).toBe(payload.firstname);
    expect(body.lastname).toBe(payload.lastname);
  });

  test('read: unknown id returns 404', async ({ request }) => {
    const res = await request.get('/booking/999999999', { headers: JSON_HEADERS });
    expect(res.status()).toBe(404);
  });

  test('read: list returns an array of booking ids', async ({ request }) => {
    const res = await request.get('/booking', { headers: JSON_HEADERS });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('bookingid');
  });

  test('read: filter by firstname finds the booking created', async ({ request }) => {
    const { id, payload } = await createBooking(request);
    createdIds.push(id);
    const res = await request.get(`/booking?firstname=${payload.firstname}`, { headers: JSON_HEADERS });
    expect(res.status()).toBe(200);
    const ids = (await res.json()).map((b) => b.bookingid);
    expect(ids).toContain(id);
  });

  test('update: full update with token changes the booking', async ({ request }) => {
    const { id, payload } = await createBooking(request);
    createdIds.push(id);
    const updated = { ...payload, totalprice: 999, additionalneeds: 'Late checkout' };
    const res = await request.put(`/booking/${id}`, {
      headers: { ...JSON_HEADERS, Cookie: `token=${token}` },
      data: updated,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.totalprice).toBe(999);
    expect(body.additionalneeds).toBe('Late checkout');
  });

  test('update: partial update (PATCH) changes only the fields sent', async ({ request }) => {
    const { id, payload } = await createBooking(request);
    createdIds.push(id);
    const res = await request.patch(`/booking/${id}`, {
      headers: { ...JSON_HEADERS, Cookie: `token=${token}` },
      data: { lastname: 'Updated' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.lastname).toBe('Updated');
    expect(body.firstname).toBe(payload.firstname);
  });

  test('update: without a token is forbidden', async ({ request }) => {
    const { id, payload } = await createBooking(request);
    createdIds.push(id);
    const res = await request.put(`/booking/${id}`, {
      headers: JSON_HEADERS,
      data: { ...payload, totalprice: 1 },
    });
    expect(res.status()).toBe(403);
  });

  test('delete: with a token removes the booking', async ({ request }) => {
    const { id } = await createBooking(request);
    const del = await request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
    // This API returns 201 on delete (200 or 204 would be more usual). Noted as an observation.
    expect(del.status()).toBe(201);
    const after = await request.get(`/booking/${id}`, { headers: JSON_HEADERS });
    expect(after.status()).toBe(404);
  });

  test('delete: without a token is forbidden', async ({ request }) => {
    const { id } = await createBooking(request);
    createdIds.push(id);
    const res = await request.delete(`/booking/${id}`);
    expect(res.status()).toBe(403);
  });
});
