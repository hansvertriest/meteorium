import pandas as pd
import time
from datetime import datetime
import math
class MeteorData:
    def __init__ (self):
        print("Loading data")
        file = "./datasets/CAMS-GMN-sanitized.txt"
        rows = None

        # METEOR DATA
        # read
        self.meteors_df = pd.read_csv(file, sep='\t', engine="python", decimal=',', nrows=rows)

        # reformat
        if not file == "./datasets/CAMS-v3-2010to2016-sanitized.txt":
            self.meteors_df = self.filterMeteorData(self.meteors_df)
            if  rows == None: 
                self.sanitizeRawFileAndSave(self.meteors_df)
        self.meteors_df['date'] = pd.to_datetime(self.meteors_df["date"])
        print("CAMS-data loaded")

        # SHOWER NAMES
        # read
        iau_df = pd.read_csv('./datasets/meteorShowers_edited.csv', sep=';', engine="python", error_bad_lines=False)
        print("Showers loaded (1/2)")
        # assign column name by index-nr
        iau_df.columns = list(range(0, len(iau_df.columns)))
        # select columns
        self.showers_df = pd.DataFrame(data={ "iauNo": iau_df[0], "iauCode": iau_df[2], "name": iau_df[3] , "parent": iau_df[21]})
        # drop duplicates
        self.showers_df = self.showers_df.drop_duplicates("iauCode")
        # strip excess spaces
        self.showers_df["name"] = self.showers_df["name"].str.strip()

        # Second dataset
        iau_IMO_df = pd.read_csv('./datasets/meteorShowers_IMO.csv', sep=",", engine="python")
        print("Showers loaded (2/2)")
        # Drop antihelion row
        iau_IMO_df.drop(index=0, inplace=True)
        # select subset of df
        iau_IMO_df = pd.DataFrame(data={ "iauCode": iau_IMO_df["IAU_code"], "start": iau_IMO_df["start"], "end": iau_IMO_df["end"], "peak": iau_IMO_df["peak"], "speed": iau_IMO_df["V"], "freqPerHour": iau_IMO_df["ZHR"]  })
        # strip excess spaces
        self.showers_df["name"] = self.showers_df["name"].str.strip()

        # JOIN TWO METEOR SHOWERS DF
        self.showers_df = self.showers_df.append(pd.DataFrame([[0, "SPO", "Sporadic Meteors", "unknown"]], columns=["iauNo", "iauCode", "name", "parent"]))
        self.showers_df = pd.merge(self.showers_df, iau_IMO_df, how="outer", left_on="iauCode", right_on="iauCode")
        self.showers_df.fillna("*", inplace=True)
        self.showers_df.replace("", "*", inplace=True)

        # ADD NAMES TO METEORS_DF
        self.meteors_df = self.meteors_df.merge(self.showers_df, left_on="iauNo", right_on="iauNo")

        # print(self.getShowerInfo("STA"))


    def sanitizeRawFileAndSave(self, df):
        # Correct records whithout komma in the coordinates
        df['latBegin'] = [ lat/10000 if lat > 200 else lat for lat in self.meteors_df['latBegin']]
        df['lonBegin'] = [ lon/10000 if lon > 200 else lon for lon in self.meteors_df['lonBegin']]
        df['latEnd'] = [ lat/10000 if lat > 200 else lat for lat in self.meteors_df['latEnd']]
        df['lonEnd'] = [ lon/10000 if lon >2100 else lon for lon in self.meteors_df['lonEnd']]

        df.to_csv('./data/CAMS-v3-2010to2016-sanitized.txt', sep='\t', decimal=',')

    def filterMeteorData(self, df):
        new_df = df[["Time", "Date", "T Begin", "T End", "Latitude Begin", "Longitude Begin", "H beg", "Latitude End", "Longitude End", "H end", "Shower I.D.", "Stations", "Network"]]
        new_df.columns = [ "time", "date", "tBegin" , "tEnd", "latBegin", "lonBegin", "hBegin", "latEnd", "lonEnd", "hEnd", "iauNo", "stations", "network"]
        return new_df


    def getShowersBeginningWith(self, search):
        return(self.showers_df[self.showers_df["name"].str.lower().str.contains(search.lower(), regex= True, na=False)])

    def getMeteorsAtDate(self, date):
        meteors_of_date_df = self.meteors_df[self.meteors_df["date"] == date]
        if not len(meteors_of_date_df):
            raise Exception()
        return meteors_of_date_df.to_dict(orient="records")

    def getDatesWithHighestMeteorFreq(self, limit=None, showerCode=None, year=None, month=None, sort=None ):
        df = self.meteors_df
        if showerCode:
            showerCode = showerCode.upper();
            df = df[df['iauCode'] == showerCode]
        if year:
            df = df[(df.date > datetime.strptime(year, "%Y")) & (df.date < datetime.strptime(str(int(year)+1), "%Y"))]
        if month:
            df = df[df['date'].dt.month == int(month)]

        # count frequency of each date
        freq_dates = df['date'].value_counts().sort_values(ascending=False)
        freq_dates_limited = freq_dates.head(limit)

        # convert to list
        freq_dates_limited_list = []
        if len(freq_dates_limited.values): 
            for date in  freq_dates_limited.index:
                freq_dates_limited_list.append({ "date": date, "count": str(freq_dates_limited[date]) })

            return { "dates": freq_dates_limited_list, "max_count": max([int(count) for count in freq_dates_limited.values]) }
        else:
            return { "dates": [], "max_count": 0 }
    
    def getDeltaDegreeOfVisibilityCone(self, height_km):
        r = 6371
        h = 6371 + height_km
        alpha = math.sqrt(h**2 - r**2) / h
        return math.asin(alpha) * 180 / math.pi

    def getMeteorsVisibleAtCoordinate(self, lon, lat, height_km = 100):
        deltaDegree = int(self.getDeltaDegreeOfVisibilityCone(height_km))

        # Filter records if they would be visible from given coordinates    
        filtered_df = self.meteors_df[ 
            (lon - deltaDegree < self.meteors_df["lonBegin"])  
            & (self.meteors_df["lonBegin"] < lon + deltaDegree) 
            & (lat - deltaDegree < self.meteors_df["latBegin"])
            & (self.meteors_df["latBegin"] < lat + deltaDegree)
        ]


        # Get meteor frequencies per shower
        freq_per_shower = filtered_df['name'].value_counts()

        # Get meteor frequencies per shower
        freq_per_day = filtered_df['date'].value_counts()

        # Group records by their name 
        filtered_groupby_name_df = filtered_df[["lonBegin", "latBegin", "name", "start", "end"]].groupby("name").mean()

        # Construct json in highest frequency order
        response = {
            "showers": []
        }

        for shower in freq_per_shower.index:
            if freq_per_shower.loc[shower] > 100:
                shower_serie = filtered_groupby_name_df.loc[shower]
                shower_dict = {}

                shower_dict["name"] = shower
                shower_dict["count"] = str(freq_per_shower.loc[shower])
                shower_dict["activityStart"] = self.showers_df[self.showers_df["name"] == shower]["start"].values[0]
                shower_dict["activityEnd"] = self.showers_df[self.showers_df["name"] == shower]["end"].values[0]

                # Get date with most shower recordings
                filtered_by_shower_df = filtered_df[ filtered_df["name"] == shower ]
                shower_freq_per_day = filtered_by_shower_df.set_index('date').resample('D').count()
                shower_dict["bestRecordedDate"] = shower_freq_per_day["peak"].idxmax()
                meteors_in_best_day = filtered_by_shower_df.loc[filtered_by_shower_df["date"] == shower_dict["bestRecordedDate"]]
                shower_dict["bestDateFirstMeteorTime"] = meteors_in_best_day.iloc[0]['time']
                shower_dict["iauCode"] = filtered_by_shower_df.iloc[0]["iauCode"]

                # Windrichting bepalen
                wind_dir = ""
                lon_m = shower_serie["lonBegin"]
                lat_m = shower_serie["latBegin"]
                d_third = deltaDegree/3

                wind_dir = "U"

                shower_dict["windDir"] = wind_dir

                response["showers"].append(shower_dict)
        return response

    def getMonthlyMeteorCount(self):
        # count frequency of each date
        freq_dates = self.meteors_df['date'].value_counts().sort_index()
        # group by month with count function
        freq_dates_per_month = freq_dates.resample('M').sum()
        # stringify datetime index
        freq_dates_per_month.index = freq_dates_per_month.index.strftime("%Y-%B")

        months_reformatted = {}
        # create for each year an attribute with an attribute months
        for date in freq_dates_per_month.index:
            date_array = date.split("-")
            year = date_array[0]
            month = date_array[1]
            frequency = freq_dates_per_month[date]

            if not year in months_reformatted.keys():
                months_reformatted[year] = { "months" : []}

            months_reformatted[year]["months"].append({ 'count': str(frequency), 'name': month})
        
        # Add year data to attribute year
        for year in months_reformatted.keys():
            # get all monthly counts
            counts_list = [ month["count"] for month in months_reformatted[year]["months"]]
            # create a max_count
            months_reformatted[year]["max_monthly_count"] = str(max([ int(count) for count in counts_list ]))
            # create a total_observations
            months_reformatted[year]["total_observations"] = 0
            for count in counts_list:
                months_reformatted[year]["total_observations"] += int(count)

        year_list = []
        for year in months_reformatted.keys():     
            new_year_dict = months_reformatted[year]
            new_year_dict["name"] = year
            year_list.append(new_year_dict)

        # return result
        return { "years": year_list, "max_yearly_count": max([year["total_observations"] for year in year_list]) }

    def getShowerInfo(self, IAU_code):
        req_shower = self.showers_df.loc[self.showers_df['iauCode'] == IAU_code.upper()]
        response = req_shower.to_dict(orient="records")[0]

        return response