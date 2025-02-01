
async function sendRequest(url)
{
    let token = localStorage.getItem('token') || '';
    let conditionOfUse = localStorage.getItem('conditionOfUse');

    if(conditionOfUse === null || conditionOfUse !== 'accepted')
    {
        return {code: 402};
    }

    let realUrl =  '/api/' + url;

    let response = await fetch(realUrl,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            },
        });

    return await response.json();
}