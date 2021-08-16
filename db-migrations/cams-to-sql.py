
import sys

dataTypes = {
    "time": "TIME", # hh:mm:ss
    "date": "DATE", # YYYY-MM-DD
    "tBegin": "NUMERIC", 
    "tEnd": "NUMERIC", 
    "latBegin": "NUMERIC", 
    "lonBegin": "NUMERIC", 
    "hBegin": "NUMERIC", 
    "latEnd": "NUMERIC", 
    "lonEnd": "NUMERIC", 
    "hEnd": "NUMERIC", 
    "iauNo": "NUMERIC", 
    "stations": "TEXT", 
    "network": "NUMERIC", 
}

def convertMMDDYYToYYYYMMDD(input):
    dateArrayMDYY = input.split("/")
    dateArrayMMDDYY = []
    for i in dateArrayMDYY:
        entry = i
        if len(i) < 2:
            entry = "0"+entry
        dateArrayMMDDYY.append(entry)
    return "20"+dateArrayMMDDYY[2]+"/"+dateArrayMMDDYY[0]+"/"+dateArrayMMDDYY[1]

# Create sql file
sqlFile = "cams-migration.sql"
txtFile= "CAMS-v3-2010to2016-sanitized.txt"
open(sqlFile, 'w').close()
f = open(sqlFile, "w")

tableName = "testobservations"

# Create table
f.write("DROP TABLE IF EXISTS  " + tableName +  ";\n" )
f.write("CREATE TABLE " + tableName +  " (\n" )
for index, key in enumerate(dataTypes.keys()):
    f.write(key + " " + dataTypes[key] + " NULL")
    if not index + 1 == len(dataTypes.keys()):
        f.write(",")
    f.write("\n")

f.write(");\n" )

# Insert values
f.write("INSERT INTO " + tableName +  " (" )
for index, key in enumerate(dataTypes.keys()):
    f.write(key)
    if not index + 1 == len(dataTypes.keys()):
        f.write(",")
f.write(") VALUES\n" )

fr = open(txtFile, "r")
for index, line in enumerate(fr):
    # skip header
    if (index == 0):
        continue
    # add a comma and newline after previous line
    if not index == 1:
        f.write(",\n")
    f.write("(")
    
    # write records
    columns = line.split("\t")[1:]
    for columnIndex, columnEntry in enumerate(columns):
        columnType = dataTypes[list(dataTypes.keys())[columnIndex]]

        if columnType == 'DATE':
            f.write("'"+convertMMDDYYToYYYYMMDD(columnEntry)+"'")
        elif columnType == 'TEXT' or columnType == 'TIME':
            f.write("'"+columnEntry.strip()+"'")
        else:
            f.write(columnEntry.strip().replace(",","."))

        if not columnIndex + 1 == len(columns):
            f.write(",")
    
    f.write(")")


fr.close()

f.close()