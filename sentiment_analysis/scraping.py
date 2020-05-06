"""
@author: Elena Stamatelou
"""
## Scraping news per municipality from google news
def scraping_google_news(municipality):
    import requests
    from bs4 import BeautifulSoup
    import re
    import pandas as pd
    headers = {"Accept-Language": "en-US, en;q=0.5"}

    keyword_first= "κορονοϊός " + municipality
    keyword_second = "COVID-19 "+ municipality
    keywords = [keyword_first, keyword_second]

    titles_all = pd.DataFrame()
    for keyword in keywords:
        url = 'https://news.google.com/search?q='+keyword+'&hl=el&gl=GR&ceid=GR%3Ael'
        results = requests.get(url, headers=headers)
        soup = BeautifulSoup(results.text, "html.parser")

        headlines=[]
        a_part = soup.find_all('div', jslog='93789')
        for container in a_part:
            b_part=container.find_all('article',jslog='85008')
            headlines.append(b_part) 

        titles=[]
        for wrd in headlines:
            e_part=re.findall('<a class="DY5T1d" .+?</a>',str(wrd))
            f_part=re.sub(r'</a>', '', str(e_part), flags=re.MULTILINE)
            c_part=re.findall('<span class="xBbh9">.+?</span>',str(wrd))
            d_part=re.sub(r'<span class="xBbh9">', '', str(c_part), flags=re.MULTILINE)
            titles.append(re.sub(r'<a class="DY5T1d" .+?>', '', str(f_part), flags=re.MULTILINE)+
                      re.sub(r'</span>', '', str(d_part), flags=re.MULTILINE))

        titles_all = pd.concat([titles_all,pd.DataFrame(titles)])
    
    titles_all = titles_all.drop_duplicates().reset_index(drop = True)
    titles_all.columns = ['headline']
    titles_all = separate(titles_all)
    titles_all = clean(titles_all, 'headline')
    titles_all = clean(titles_all, 'content')
    return titles_all

def separate(df):
    new =  df['headline'].str.split("]", n = 1, expand = True)   
    df['headline']= new[0] 
    df['content']= new[1] 
    return df

def clean(df, column):
     df[column]=[s.replace("'",'').replace("[]",str(0)).replace('[','').replace(']','').replace("\\","'").replace("&amp", "and")  for s in df[column]]
     return df