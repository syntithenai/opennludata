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
  - name: ResponseSelector
    epochs: 100
  - name: DIETClassifier
    epochs: 100
  - name: EntitySynonymMapper

policies:
  - name: FormPolicy
  - name: MemoizationPolicy
  - name: TEDPolicy
    max_history: 5
    epochs: 100
  - name: MappingPolicy
  - name: "FallbackPolicy"
    nlu_threshold: 0.5
    core_threshold: 0.3
    fallback_action_name: "action_default_fallback"
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
#action_endpoint:
#  url: http://localhost:5055/webhook

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
    domain: `
session_config:
  carry_over_slots_to_new_session: true
  session_expiration_time: 5    

`   
}
export default RASATemplates
