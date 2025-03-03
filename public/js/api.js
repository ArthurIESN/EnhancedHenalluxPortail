
async function sendRequest(url, items)
{
    let conditionOfUse = localStorage.getItem('conditionOfUse');

    let parsedCondition;
    try {
        parsedCondition = JSON.parse(conditionOfUse);
    } catch (e) {
        return {code: 402};
    }

    if (parsedCondition === null || parsedCondition.v !== '1.1' || parsedCondition.status !== 'accepted') {
        return {code: 402};
    }

    let realUrl =  '/api/' + url;

    let response = await fetch(realUrl,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            body: JSON.stringify(items)
        });

    let res = await response.json();
    return res;
}