const request = require('supertest')
const fetch = require("node-fetch");

const exprBaseRoute = 'http://0.0.0.0:8000';
const flaskBaseRoute = 'http://127.0.0.1:5000';

describe('Post Endpoints', () => {
  it('should get return same as python server', async () => {

    const route = '/meteors/21-10-20'

    const resExpress = await fetch(exprBaseRoute+route)
        .then((res) => {
            return res.json();
        })
    
    const resFlask = await fetch(flaskBaseRoute+route)
        .then((res) => {
            return res.json();
        })
    
    expect(resExpress.meteors[0]).toEqual(resFlask.meteors[0])
  })
})