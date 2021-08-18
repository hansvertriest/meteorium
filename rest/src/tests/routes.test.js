const request = require('supertest')
const fetch = require("node-fetch");

const exprBaseRoute = 'http://0.0.0.0:8000';
const flaskBaseRoute = 'http://127.0.0.1:5000';

describe('Outputs to another', () => {
  it('should return same as python server', async () => {

    const route = '/meteors/21-10-10'

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
//   it('should return same as python server', async () => {

//     const route = '/showers/search/au'

//     const resExpress = await fetch(exprBaseRoute+route)
//         .then((res) => {
//             return res.json();
//         })
    
//     const resFlask = await fetch(flaskBaseRoute+route)
//         .then((res) => {
//             return res.json();
//         })
    
//     expect(resExpress).toEqual(resFlask)
//   })
  it('should return same as python server', async () => {

    const route = '/count/month'

    const resExpress = await fetch(exprBaseRoute+route)
        .then((res) => {
            return res.json();
        })
    
    const resFlask = await fetch(flaskBaseRoute+route)
        .then((res) => {
            return res.json();
        })
    
    expect(resExpress).toEqual(resFlask)
  })
})