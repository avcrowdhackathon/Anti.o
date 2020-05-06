"""
@author: Elena Stamatelou
"""
#!pip install newsapi-python
#!pip install googletrans
#!python -m spacy download en_core_web_md
#!pip install SentimentIntensityAnalyzer
# From NEWS API
#column = news['headline']
def polarity_analysis(column):
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    import pandas as pd
    from googletrans import Translator
    
    
    column = column.str.lower()
    # apply vader
    
    final_results = pd.DataFrame()
    for i in range(len(column)):
        text = column[i]
        translation = Translator().translate(text, dest='en')
        
        vs = SentimentIntensityAnalyzer().polarity_scores(translation.text)
#        print(vs)
        results = pd.DataFrame([vs['neg'],  vs['neu'],  vs['pos'],  vs['compound']]).T
        final_results = pd.concat([final_results,results])    
    final_results.columns = ['negative', 'neutral', 'positive', 'compound']
    final_results = final_results.reset_index(drop = True)
    return final_results
