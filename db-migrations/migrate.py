import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.types import Float, Text, BigInteger, Time, Date, Integer


class MeteorData:
    def __init__ (self):
        print("Loading data")
        file = "CAMS-v3-2010to2016-sanitized.txt"
        rows = None

        # METEOR DATA
        # read
        self.meteors_df = pd.read_csv(file, sep='\t', engine="python", decimal=',', nrows=rows)

        # reformat
        if not file == "CAMS-v3-2010to2016-sanitized.txt":
            self.meteors_df = self.filterMeteorData(self.meteors_df)
            if  rows == None: 
                self.sanitizeRawFileAndSave(self.meteors_df)
        self.meteors_df['date'] = pd.to_datetime(self.meteors_df["date"])
        print("CAMS-data loaded")

        # SHOWER NAMES
        # read
        iau_df = pd.read_csv('./meteorShowers_edited.csv', sep=';', engine="python")
        print("Showers loaded (1/2)")
        # assign column name by index-nr
        iau_df.columns = list(range(0, len(iau_df.columns)))
        # select columns
        self.showers_df = pd.DataFrame(data={ "iau_no": iau_df[0], "iau_code": iau_df[2], "name": iau_df[3] , "parent": iau_df[21]})
        # drop duplicates
        self.showers_df = self.showers_df.drop_duplicates("iau_code")
        # strip excess spaces
        self.showers_df["name"] = self.showers_df["name"].str.strip()

        # Second dataset
        iau_IMO_df = pd.read_csv('./meteorShowers_IMO.csv', sep=",", engine="python")
        print("Showers loaded (2/2)")
        # Drop antihelion row
        iau_IMO_df.drop(index=0, inplace=True)
        # select subset of df
        iau_IMO_df = pd.DataFrame(data={ "iau_code": iau_IMO_df["IAU_code"], "start": iau_IMO_df["start"], "end": iau_IMO_df["end"], "peak": iau_IMO_df["peak"], "speed": iau_IMO_df["V"], "freq_per_hour": iau_IMO_df["ZHR"]  })
        # strip excess spaces
        self.showers_df["name"] = self.showers_df["name"].str.strip()

        # JOIN TWO METEOR SHOWERS DF
        self.showers_df = self.showers_df.append(pd.DataFrame([[0, "SPO", "Sporadic Meteors", "unknown"]], columns=["iau_no", "iau_code", "name", "parent"]))
        self.showers_df = pd.merge(self.showers_df, iau_IMO_df, how="outer", left_on="iau_code", right_on="iau_code")
        # self.showers_df.fillna("*", inplace=True)
        # self.showers_df.replace("", "*", inplace=True)

        # ADD NAMES TO METEORS_DF
        # self.meteors_df = self.meteors_df.merge(self.showers_df, left_on="iauNo", right_on="iauNo")

        self.migrateData()


    def sanitizeRawFileAndSave(self, df):
        # Correct records whithout komma in the coordinates
        df['lat_begin'] = [ lat/10000 if lat > 200 else lat for lat in self.meteors_df['lat_begin']]
        df['lon_begin'] = [ lon/10000 if lon > 200 else lon for lon in self.meteors_df['lon_begin']]
        df['lat_end'] = [ lat/10000 if lat > 200 else lat for lat in self.meteors_df['lat_end']]
        df['lon_end'] = [ lon/10000 if lon >2100 else lon for lon in self.meteors_df['lon_end']]

        df.to_csv('./CAMS-v3-2010to2016-sanitized.txt', sep='\t', decimal=',')

    def filterMeteorData(self, df):
        new_df = df[["Time", "Date", "T Begin", "T End", "Latitude Begin", "Longitude Begin", "H beg", "Latitude End", "Longitude End", "H end", "Shower I.D.", "Stations", "Network"]]
        new_df.columns = [ "time", "date", "t_begin" , "t_end", "lat_begin", "lon_begin", "h_begin", "lat_end", "lon_end", "h_end", "iau_no", "stations", "network"]
        return new_df

    def migrateData(self):
        engine = create_engine('postgresql://hans:9632@postgres:5432/meteorium')
        self.showers_df.to_sql(
            'showers',
            engine,
            if_exists='fail',
            index=False,
            dtype={
                "iau_no": BigInteger,
                "iau_code": Text,
                "name": Text,
                "parent": Text,
                "start": Text,
                "end": Text,
                "peak": Text,
                "speed": Float,
                "freq_per_hour": Float,
            }
        )
        print("Migrated showers")
        self.meteors_df.to_sql(
            'observations',
            engine,
            if_exists='fail',
            index=False,
            dtype={
                "time": Time,
                "date": Date,
                "t_begin": Integer,
                "t_end": Integer,
                "lat_begin": Float,
                "lon_begin": Float,
                "h_begin": Integer,
                "lat_end": Float,
                "lon_end": Float,
                "h_end": Integer,
                "iau_no": Integer,
                "stations": Text,
                "network": Integer,
            }
        )
        print("Migrated showers")




data = MeteorData()


