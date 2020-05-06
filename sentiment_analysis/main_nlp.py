"""
@author:  Elena Stamatelou
"""
import scraping
import polarity
import pandas as pd
import numpy as np

# define the municipality
municipality = "Αθήνα"
#municipality = "Μαρούσι"

# scrape the COVID-19 news for the selected municipality
news = scraping.scraping_google_news(municipality)

# apply opinion mining 
polarity_results = polarity.polarity_analysis(news['headline'])
polarity_results_content =  polarity.polarity_analysis(news['content'])
news_polarity = pd.concat([news,polarity_results, polarity_results_content], axis = 1)
news_polarity.columns = ['headline', 'content', 'hnegative', 'hneutral', 'hpositive', 'hcompound',
       'cnegative', 'cneutral', 'cpositive', 'ccompound']
news_polarity['average_polarity'] = (news_polarity.hcompound + news_polarity.ccompound)/2
news_final = news_polarity[['headline', 'content', 'average_polarity']]
news_final['tag'] = np.where(news_polarity['average_polarity']>0.5, "positive", 
                             np.where(news_polarity['average_polarity']<-0.3, "negative","neutral"))
# save the results 
news_final.to_csv("polarity_greek_news.csv", index = False)