const RASATemplates = {
    config: `
language: en
pipeline:
  - name: WhitespaceTokenizer
  - name: RegexFeaturizer
  - name: LexicalSyntacticFeaturizer
  - name: CountVectorsFeaturizer
  - name: CountVectorsFeaturizer
    analyzer: "char_wb"
    min_ngram: 1
    max_ngram: 4
  - name: DIETClassifier
    epochs: 100
  - name: EntitySynonymMapper
  - name: ResponseSelector
    epochs: 100

policies:
  - name: MemoizationPolicy
  - name: RulePolicy
  - name: TEDPolicy
    max_history: 5
    epochs: 100
    `,
    credentials: `
# This file contains the credentials for the voice & chat platforms
# which your bot is using.
# https://rasa.com/docs/rasa/user-guide/messaging-and-voice-channels/

rest:
#  # you don't need to provide anything here - this channel doesn't
#  # require any credentials


#facebook:
#  verify: "<verify>"
#  secret: "<your secret>"
#  page-access-token: "<your page access token>"

#slack:
#  slack_token: "<your slack token>"
#  slack_channel: "<the slack channel>"

#socketio:
#  user_message_evt: <event name for user message>
#  bot_message_evt: <event name for but messages>
#  session_persistence: <true/false>

#mattermost:
#  url: "https://<mattermost instance>/api/v4"
#  token: "<bot token>"
#  webhook_url: "<callback URL>"

#rasa:
  #url: "http://localhost:5002/api"
 
    `,
    endpoint: `
# This file contains the different endpoints your bot can use.

# Server where the models are pulled from.
# https://rasa.com/docs/rasa/model-storage#fetching-models-from-a-server

#models:
#  url: http://my-server.com/models/default_core@latest
#  wait_time_between_pulls:  10   # [optional](default: 100)

# Server which runs your custom actions.
# https://rasa.com/docs/rasa/custom-actions

#action_endpoint:
#  url: "http://localhost:5055/webhook"

# Tracker store which is used to store the conversations.
# By default the conversations are stored in memory.
# https://rasa.com/docs/rasa/tracker-stores

#tracker_store:
#    type: redis
#    url: <host of the redis instance, e.g. localhost>
#    port: <port of your redis instance, usually 6379>
#    db: <number of your database within redis, e.g. 0>
#    password: <password used for authentication>
#    use_ssl: <whether or not the communication is encrypted, default false>

#tracker_store:
#    type: mongod
#    url: <url to your mongo instance, e.g. mongodb://localhost:27017>
#    db: <name of the db within your mongo instance, e.g. rasa>
#    username: <username used for authentication>
#    password: <password used for authentication>

# Event broker which all conversation events should be streamed to.
# https://rasa.com/docs/rasa/event-brokers

#event_broker:
#  url: localhost
#  username: username
#  password: password
#  queue: queue

    `,
    actions:  `
""" RASA actions """
 
    `,
    single_action: function(className, actionName) {
        return `
""" RASA action """
import sys
import logging
from typing import Any, Text, Dict, List
from datetime import datetime
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction

class `+className+`(Action):
    def name(self) -> Text:
        return "`+actionName+`"
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        var slotsets = []
        logger = logging.getLogger(__name__)    
        logger.debug('Action `+actionName+`')
        return [SlotSet("hermod_force_end", "true"),SlotSet("hermod_force_continue", None)] 
        
        dispatcher.utter_message(text="Action `+actionName+`")
        return slotsets
    
    `
    }
    ,
    session:`
session_config:
  carry_over_slots_to_new_session: true
  session_expiration_time: 5
`
}
export default RASATemplates
