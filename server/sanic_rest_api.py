""" Hermod Web Service providing authentication and serving associated web app"""
import logging
import sys
import json as jsonlib
import asyncio
import os
import string
import random
from subprocess import call
import types
import motor
import motor.motor_asyncio
from bson.objectid import ObjectId
from sanic import Sanic
from sanic.exceptions import ServerError
from sanic.response import json, file, file_stream



def mongo_connect(connection_string, database, collection):
    """connect to mongodb"""
    client = motor.motor_asyncio.AsyncIOMotorClient(connection_string)
    db = client[database]
    collection = db[collection]
    return collection


# # http -> https
SECUREREDIRECTOR = Sanic("secure_redirect")
# secureredirector.route('/<path:path>')

async def catch_all(request, path=''):
    """ handle redirect to SSL """
    print(['catchall root',request])
    return await text('https://')


async def catch_all_root(request):
    """ handle redirect to SSL"""
    return await file('/app/www/secure_redirect.html')

SECUREREDIRECTOR.add_route(catch_all_root, '/')
SECUREREDIRECTOR.add_route(catch_all, '/<path:path>')



class SanicRestApi():
    """ web service for react application """
    def __init__(self, config):
        self.config = config
        

    async def run(self):
        """start the web service"""
        cert_path = self.config['services']['WebService'].get(
            'certificates_folder')
        # if os.path.isfile(cert_path +
                          # '/cert.pem') and os.path.isfile(cert_path +
                                                          # '/privkey.pem'):
            # ssl = {
                # 'cert': cert_path + "/cert.pem",
                # 'key': cert_path + "/privkey.pem"}
        server = SECUREREDIRECTOR.create_server(
            host="0.0.0.0", port=80, access_log=True, return_asyncio_server=True)
        # ssl_server = APP.create_server(
            # host="0.0.0.0",
            # port=443,
            # access_log=True,
            # return_asyncio_server=True,
            # ssl=ssl)
        # asyncio.ensure_future(ssl_server)
        asyncio.ensure_future(server)
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            server.close()
                # ssl_server.close()
        # else:
            # print("Failed to start web server - MISSING SSL CERTS")


# # # main web server
# APP = Sanic("hermodweb")


# async def ssl_catch_all_root(request):
    # """handle request for site root /"""
    # return await file('/app/www/spokencrossword/build/index.html')


# async def ssl_serve_file(request, path):
    # """handle request for site /path..."""
    # parts = path.split("/")
    # root_path = '/app/www/spokencrossword/build/'
    # file_path = path
    # if parts and parts[0] == 'vanilla':
        # root_path = '/app/www/spokencrossword/vanilla/static/'
        # file_path = "/".join(parts[1:])
    # elif parts and parts[0] == 'tts':
        # root_path = '/app/www/tts/'
        # file_path = "/".join(parts[1:])

    # try:
        # if file_path == '':
            # file_path = 'index.html'
        # return await file_stream(root_path + file_path)
    # except FileNotFoundError:
        # return await file_stream(root_path + 'index.html')
    # except BaseException:
        # raise ServerError("Server Error", status_code=500)

# APP.add_route(ssl_catch_all_root, '/')
# APP.add_route(ssl_serve_file, '/<path:path>')
# logging.getLogger('sanic_cors').level = logging.DEBUG

# # old plain javascript version
# APP.static(
    # '/vanilla',
    # '/app/www/spokencrossword/vanilla/static',
    # stream_large_files=True)

# # config request - connection details for mqtt


# async def get_hermod_config(request):
    # """ generate auth configuration for web user"""
    # data = await get_mosquitto_user("webuser")

    # webconfig = {
        # "username": data.get('email_clean'),
        # "password": data.get('password'),
        # "subscribe": "hermod/" + data.get('email_clean') + "/#",
        # "hotwordsensitivity": 0.5,
        # "site": data.get('email_clean')
    # }

    # # direct from env vars because config not available (could try embed sanic
    # # and routes inside webservice?)
    # webconfig['analytics_code'] = os.getenv('GOOGLE_ANALYTICS_CODE', '')
    # webconfig['adsense_key'] = os.getenv('ADSENSE_KEY', '')
    # webconfig['adsense_slot'] = os.getenv('ADSENSE_SLOT', '')
    # return json(webconfig)

# APP.add_route(get_hermod_config, "/config")


# # CROSSWORDS
# async def get_crosswords(request):
    # """ search for crosswords from mongo"""
    # search = request.args.get('search', '')
    # difficulty = request.args.get('difficulty', '')
    # try:
        # collection = mongo_connect('crosswords')
        # and_parts = []
        # if search:
            # and_parts.append({'title': {'$regex': search, '$options': 'i'}})
        # if difficulty:
            # and_parts.append(
                # {'$or': [{'difficulty': difficulty}, {'difficulty': int(difficulty)}]})
        # print('GET CROSSWORD and_parts')
        # query = {}
        # limit = 2000
        # if and_parts:
            # and_parts.append({'access': {'$exists': False, '$nin': ['']}})
            # query = {'$and': and_parts}
        # else: 
            # # ensure sufficient results for collation 
            # limit = 2000
        # crosswords = []
        # cursor = collection.find(query,{'title': 1, 'difficulty': 1})
        # cursor.sort('title', 1).limit(limit)
        # results_per_difficulty = 2
        # # for empty search limit results per difficulty value to
        # # results_per_difficulty
        # difficulty_tallies = {}
        # async for document in cursor:
            # document['_id'] = str(document.get('_id'))
            # difficulty_tally = int(difficulty_tallies.get(
                # str(document.get('difficulty')), '0'))
            # difficulty_tallies[str(document.get(
                # 'difficulty'))] = difficulty_tally + 1
            # if difficulty_tallies[str(document.get(
                    # 'difficulty'))] <= results_per_difficulty or and_parts:
                # crosswords.append(document)
        # return json(crosswords)
    # except BaseException:
        # exception = sys.exc_info()
        # print(exception)


# async def get_crossword(request):
    # """ load a crossword from mongo"""
    # if request.args.get('id', False):
        # try:
            # collection = mongo_connect('crosswords')
            # query = {'_id': ObjectId(request.args.get('id'))}
            # document = await collection.find_one(query)
            # document['_id'] = str(document.get('_id'))
            # if request.args.get('site', False):
                # await publish('hermod' + request.args.get('site') + 'rasa/setslots', {
                    # "slots": [{"crossword": document['_id']}]
                # })
            # return json(document)
        # except BaseException:
            # exception = sys.exc_info()
            # print(exception)


# APP.add_route(get_crossword, "/api/crossword")
# APP.add_route(get_crosswords, "/api/crosswords")

