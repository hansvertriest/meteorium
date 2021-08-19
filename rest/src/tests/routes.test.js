const request = require('supertest')
const fetch = require("node-fetch");

const exprBaseRoute = 'http://0.0.0.0:8000';
const flaskBaseRoute = 'http://127.0.0.1:5000';

const doFetches = async (route) => {
    const resExpress = await fetch(exprBaseRoute+route)
        .then((res) => {
            return res.json();
        })
    
    const resFlask = await fetch(flaskBaseRoute+route)
        .then((res) => {
            return res.json();
        })

    return {resExpress, resFlask};
}

describe('Outputs to another', () => {
  it('getMeteors should return same as python server', async () => {

    const route = '/meteors/21-10-10'
    const { resExpress, resFlask } = await doFetches(route);
    expect(resExpress.meteors[0]).toEqual(resFlask.meteors[0])
  })
//   it('searchShowers should return same as python server', async () => {

//     const route = '/showers/search/au'
//     const { resExpress, resFlask } = await doFetches(route);  
//     expect(new Set(resExpress)).toEqual(new Set(resFlask))
//   })
  it('getMonthlyCount should return same as python server', async () => {

    const route = '/count/month'
    const { resExpress, resFlask } = await doFetches(route);
    expect(resExpress).toEqual(resFlask)
  })

  it('getShowerInfo should return same as python server', async () => {

    const route = '/showerinfo/spo'
    const { resExpress, resFlask } = await doFetches(route);
    expect(resExpress).toEqual(resFlask)
  })


  it('getTopDates should return same as python server', async () => {
    const route = '/topdates?limit=35&shower=spo&year=2016&month=8'
    const { resExpress, resFlask } = await doFetches(route);
    expect(new Set(resExpress.dates)).toEqual(new Set(resFlask.dates))
  })
})