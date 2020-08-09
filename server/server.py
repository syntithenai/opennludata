""" Syntithenai Web Server"""
from sanic_rest_api import SanicRestApi
import asyncio
# from env
DOMAINS={
    'localhost':{
        'collections': {
            'stuffcollection': {
                'mongo_connection_string':'mongodb://localhost:27017',
                'allow':['read','write','delete']
            }
        },
        # contained certs must be named privkey.pem, cert,pem
        'certificates_folder':''
    }
}

server = SanicRestApi(DOMAINS)
# loop = asyncio.get_event_loop()
# loop.run_until_complete(server.run)
await server.run()
