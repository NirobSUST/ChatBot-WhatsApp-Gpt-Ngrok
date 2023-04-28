import config
from langchain.llms import OpenAI
import os
import sqlalchemy.dialects.sqlite
from langchain import OpenAI, SQLDatabase, SQLDatabaseChain
from langchain.memory import ConversationBufferMemory
from PyPDF2 import PdfReader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import ElasticVectorSearch, Pinecone, Weaviate, FAISS
from langchain.document_loaders import PyPDFLoader
from langchain.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.chains.question_answering import load_qa_chain
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from langchain.callbacks import get_openai_callback
from langchain.agents import initialize_agent, Tool
from langchain.agents import load_tools

def count_tokens(agent, query):
        with get_openai_callback() as cb:
            result = agent(query)
            print(f'Spent a total of {cb.total_tokens} tokens')

        return result


def initiation():
    os.environ["OPENAI_API_KEY"] = config.open_ai_key

    llm = OpenAI(temperature=0, model_name='text-davinci-003')

    """# Load data from pdf"""

    """## Using Retrival qa"""

    loader = PyPDFLoader("./content/robi-elite.pdf")
    data = loader.load()

    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    docs = text_splitter.split_documents(data)

    embeddings = OpenAIEmbeddings()

    vectorstore = Chroma.from_documents(docs, embeddings)

    rchain = RetrievalQA.from_chain_type(llm, chain_type="stuff", retriever=vectorstore.as_retriever())

    # query = "What is my gold points if my network age is 1 Years - <3 Years?"
    # rchain.run(query)

    """# Load data from database"""

    db = SQLDatabase.from_uri("mssql+pymssql://sqlserver:bs23rnd@34.121.253.240:1433/robi-service")

    db_chain = SQLDatabaseChain(llm=llm, database=db, verbose=True)

    """# Custom Tool and Agent"""

    doc_tool =  Tool(
        name='Robi elite faq',
        func = rchain.run,
        description="Useful for when you need to answer frequently asked questions about elite services provided by Robi mobile company.")

    sql_tool = Tool(
        name='Robi service DB',
        func=db_chain.run,
        description="Useful for when you need to answer questions about different services and their prices provided by Robi mobile company." \
                    "The services include balance status, internet packages, voice packages, robi elite services"
    )

    tools = load_tools(["llm-math"], llm=llm)

    tools.append(sql_tool)
    tools.append(doc_tool)
    

    memory = ConversationBufferMemory(memory_key="chat_history")

    conversational_agent = initialize_agent(
        agent='conversational-react-description',
        tools=tools, 
        llm=llm,
        verbose=True,
        max_iterations=4,
        memory=memory,
    )


    # result = count_tokens(conversational_agent,"How to check Robi Elite category?")

    # result = count_tokens(conversational_agent,"What is my gold points if my network age is 1 Years - <3 Years?")
    # result = count_tokens(conversational_agent, "Please provide me the total prices for internet services for 30 days, not the bundle service")
    # result = count_tokens(conversational_agent, "How many restaurants are giving elite offer for gold elite category?")

    """# Test the SQLDatabasechain"""

    # db_chain.run("How many restauratns are giving elite offer for gold elite category?")

    # db_chain.run("What is the total amount for internet package with 30 days validity?")
    return conversational_agent

def run(text, conversational_agent):
    return count_tokens(conversational_agent, text)