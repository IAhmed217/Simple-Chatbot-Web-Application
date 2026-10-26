from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect
from django.http import HttpResponse
import json

from langchain_cohere import ChatCohere
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import MessagesState, StateGraph, START, END
from langchain.chat_models import init_chat_model
import uuid
from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages

import os
from dotenv import load_dotenv

load_dotenv()

llm = init_chat_model('command-a-03-2025')

class State(TypedDict):
    messages: Annotated[list, add_messages]
    #message_intent: str | None

def prompt_llm(state: MessagesState):
    messages = [{'role': 'system', 'content': 'You are a talkative chatbot for fun but also a helpful chatbot for handling Wikipedia queries. Your name is Wikibot.'}] + state['messages']
    response = llm.invoke(messages)
    return {'messages': [{'role': 'assistant', 'content': response.content}]}

graph_builder = StateGraph(State)
graph_builder.add_node(prompt_llm)
graph_builder.add_edge(START, 'prompt_llm')
graph_builder.add_edge('prompt_llm',END)

checkpointer = InMemorySaver()
graph = graph_builder.compile(checkpointer=checkpointer)

config = {'configurable': {'thread_id': uuid.uuid4()}}

def homepage_view(request):
    return render(request, 'wikibot/homepage.html')

def send_query(request):
    if request.method == 'POST':
        user_input = json.loads(request.body.decode('utf-8'))
        print(user_input)

        response = graph.invoke({"messages":[{"role": "user","content":user_input["message"]}]}, config=config)
        return HttpResponse(json.dumps({"reply": response['messages'][-1].content}))