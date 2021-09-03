# Meteorium
Find the live project here at [the Meteroium](www.meteorium.space).<br>
CAMS-data references:<br>
P. Jenniskens, J. Baggaley, I. Crumpton, P. Aldous, P. Pokorny, D. Janches, P. S. Gural, D. Samuels, J. Albers, A. Howell, C. Johannink, M. Breukers, M. Odeh, N. Moskovitz, J. Collison, S. Ganju, 2018. A survey of southern hemisphere meteor showers. Planetary Space Science 154, 21–29.

## Getting started
### Client
This is a react project, to run it:
```
npm run install
npm run start
```

### Server
To start the server you will need to provide a txt-version of the [CAMS-data](http://cams.seti.org/CAMS-v3-2010to2016.xlsx). This is to be named as `server/data/CAMS-v3-2010to2016-sanitized.txt`.
The server-dependiencies are installed as followed: 
```
pip3 install flask
pip3 install pandas
```
And started like so:
```
python3 main.py
```
