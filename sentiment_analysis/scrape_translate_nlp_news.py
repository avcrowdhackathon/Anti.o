"""
@author: Elena Stamatelou
"""
#!pip install newsapi-python
#!pip install googletrans
#!python -m spacy download en_core_web_md
#!pip install SentimentIntensityAnalyzer
# From NEWS API

from newsapi.newsapi_client import NewsApiClient
import pandas as pd
from googletrans import Translator

# scrape news
newsapi = NewsApiClient(api_key='a5c184912f3c454d98143a47ea6109e9')
#top-headlines
municipality = "Αθήνα"
keyword = 'κορονο+ AND '
query = keyword + municipality

top_headlines = newsapi.get_top_headlines(q='κορωνοϊός', country='gr')

final_results = pd.DataFrame()
for i in range(len(top_headlines['articles'])):
#    i=1
    title = top_headlines['articles'][i]['title']

    translation = Translator().translate(title, dest='en')
    print(translation.origin, ' -> ', translation.text)

    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    analyzer = SentimentIntensityAnalyzer() 
    vs = analyzer.polarity_scores(translation.text)
    print(vs)
    results = pd.DataFrame([translation.origin,translation.text, vs['neg'],  vs['neu'],  vs['pos'],  vs['compound']]).T

    final_results = pd.concat([final_results,results])
    
final_results.columns = ['greek', 'english','negative', 'neutral', 'positive', 'compound']
final_results.to_csv("polarity_analysis_results3.csv", index=False, encoding='utf-8-sig')