import requests



def translate(word):
    base_url = "https://translate.yandex.net/api/v1.5/tr.json/translate?"
    key = 'key=' + "trnsl.1.1.20190302T221501Z.db0a8355be3caec7.473bf490f3317210f75eff2f74de67bd788dc48e"
    text = "text=" + word
    lang = "lang=" + "en-zh"

    url = base_url + key + "&" + text + "&" + lang

    response = requests.get(url)
    data = response.json()
    return data["text"][0]


