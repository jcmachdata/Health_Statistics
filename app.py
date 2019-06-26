import os
import json

import pandas as pd
import numpy as np
import pymysql

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

pymysql.install_as_MySQLdb()

app = Flask(__name__)


#################################################
# Database Setup
#################################################

# engine = create_engine(
#     "mysql://rl91qzpzgty8oaf1:evamhxfd7l42mgso@y2w3wxldca8enczv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/v21ogkg4wvsne316")
#
# # reflect an existing database into a new model
# Base = automap_base()
# # reflect the tables
# Base.prepare(engine, reflect=True)
#
# # print table names
# print(engine.table_names())
# # Save reference to the table
# Hale = Base.classes.hale


app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://rl91qzpzgty8oaf1:evamhxfd7l42mgso@y2w3wxldca8enczv.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/v21ogkg4wvsne316"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Hale = Base.classes.hale
Lex = Base.classes.lex
Obesity = Base.classes.obesity
Glucose = Base.classes.glucose
Daly = Base.classes.newDaly
Flags = Base.classes.flagScatter
#
#


def return_values(data, country_id):
    mydict = {}
    if ((data['id'] == country_id).any()):
        myrow = data.loc[data['id'] == country_id]
        for key in data.columns.values:
            if ((key == 'id') or (key == 'Population') or (key == 'Country')):
                mydict[key] = myrow.iloc[0, ][key]
            else:
                mydict[key] = float(myrow.iloc[0, ][key].replace(',', '')) /\
                    float(myrow.iloc[0, ]['Population'].replace(',', '')) * 100

    else:
        for key in data.columns:
            mydict[key] = 0
    return(mydict)


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/diseases")
def diseases():
    return render_template("diseases.html")


@app.route("/riskfactors")
def riskfactors():
    return render_template("riskfactors.html")


@app.route("/spending")
def spending():
    return render_template("spending.html")


@app.route("/countries")
def countries():
    """Return a list of countries."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(Lex).statement
    df = pd.read_sql_query(stmt, db.session.bind)
    df.head()
    # Return a list of the column names (sample names)
    return jsonify(list(df['Country'].unique()))


@app.route("/daly")
def daly():
    """Return all daly data in geojson format"""

    # data = pd.read_csv('assets/data/newDaly.csv', encoding="ISO-8859-1")
    # data.shape
    country_geo = 'assets/data/world-countries.json'

    stmt = db.session.query(Daly).statement
    data = pd.read_sql_query(stmt, db.session.bind)
    keys = data.columns.values
    with open('assets/data/world-countries.json') as f:
        worldData = json.load(f)

    # append health data to geojson object for each country
    for feature in worldData['features']:
        country_id = feature['id']
        country_dict = return_values(data, country_id)
        for key in keys:
            feature['properties'][key] = country_dict[key]

    return jsonify(worldData)


@app.route("/hale")
def hale():
    """Return all data."""
    stmt = db.session.query(Lex).statement
    df = pd.read_sql_query(stmt, db.session.bind)
    df['Year'] = df['Year'].astype(str)
    jsonfiles = json.loads(df.to_json(orient='records'))
    return jsonify(jsonfiles)


@app.route("/obesity")
def obesity():
    """Return all obesity data"""
    stmt = db.session.query(Obesity).statement
    df = pd.read_sql_query(stmt, db.session.bind)
    jsonfiles = json.loads(df.to_json(orient='records'))
    return jsonify(jsonfiles)


@app.route("/glucose")
def glucose():
    """Return all obesity data"""
    stmt = db.session.query(Glucose).statement
    df = pd.read_sql_query(stmt, db.session.bind)
    jsonfiles = json.loads(df.to_json(orient='records'))
    return jsonify(jsonfiles)


@app.route("/flags")
def flags():
    """Return all flag data for scatter plot"""
    stmt = db.session.query(Flags).statement
    df = pd.read_sql_query(stmt, db.session.bind)
    jsonfiles = json.loads(df.to_json(orient='records'))
    return jsonify(jsonfiles)


@app.route("/hale/<country>")
def hale_country(country):
    """Return the HALE data for a given country."""


@app.route("/obesity/<country>")
def obesity_country(country):
    """Return obesity data for a given country"""


if __name__ == "__main__":
    app.run(debug=True)
