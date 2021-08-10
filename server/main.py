import flask
from flask import request
from data import MeteorData
from urllib.parse import unquote
from flask_cors import CORS, cross_origin

# INIT FLASK
app = flask.Flask(__name__)
cors = CORS(app)
app.config["DEBUG"] = True
app.config['CORS_HEADERS'] = 'Content-Type'

data = MeteorData()

@app.route('/', methods=['GET'])
@cross_origin()
def home():
    return "<h1>CAMS-data API (2010-16)</h1>"

@app.route('/showers/search/<word>', methods=['GET'])
@cross_origin()
def searchShower(word):
    return(data.getShowersBeginningWith(unquote(word)).to_json(orient="records"))

@app.route('/meteors/<date>', methods=['GET'])
@cross_origin()
def meteors(date):
    try: 
        return {
            "date": date,
            "meteors": data.getMeteorsAtDate(date)
        }
    except Exception as e:
        print(e)
        return {"error": "Could not find data"}

@app.route('/count/month', methods=['GET'])
@cross_origin()
def monthlyCount():
    try: 
        months = data.getMonthlyMeteorCount()
    except Exception as e:
        print(e)
        return {"error": "Could not find data"}
    else:
        return months

@app.route('/topdates', methods=['GET'])
@cross_origin()
def yearlyCount():
    try: 
        limit = request.args.get('limit')
        showerCode = request.args.get('shower')
        year = request.args.get('year')
        month = request.args.get('month')
        topdates = data.getDatesWithHighestMeteorFreq( int(limit), showerCode, year, month)
    except Exception as e:
        print(e)
        return {"error": "Could not find data"}
    else:
        return topdates

@app.route('/meteors-at-location', methods=['GET'])
@cross_origin()
def meteorsAtLocation():
    try: 
        lon = request.args.get('lon')
        lat = request.args.get('lat')

        showers = data.getMeteorsVisibleAtCoordinate(float(lon), float(lat))
    except Exception as e:
        print(e)
        return {"error": "Could not find data"}
    else:
        return showers

@app.route('/showerinfo/<iauCode>', methods=['GET'])
@cross_origin()
def getShowerInfo(iauCode):
    try: 
        info = data.getShowerInfo(iauCode)
    except Exception as e:
        print(e)
        return {"error": "Could not find data"}
    else:
        return info


app.run()
# python3 main.py --host 0.0.0.0 --cert==cert.pem --key=key.pem
# PIGENT: 192.168.0.227