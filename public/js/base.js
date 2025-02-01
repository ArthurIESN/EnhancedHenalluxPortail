

let myPromotions = null;
let calendar = null;
let promotionContainer;
let promotionList;
let class_b1;
let class_b2;
let class_b3;
let class_other;
let calendarMessage;



document.addEventListener('DOMContentLoaded', async function()
{
    class_b1 = document.getElementById('class_b1_container');
    class_b2 = document.getElementById('class_b2_container');
    class_b3 = document.getElementById('class_b3_container');
    class_other = document.getElementById('class_other_container');
    promotionContainer = document.getElementById('promotions-container');
    promotionList = document.getElementById('promotions-list');
    calendarMessage = document.getElementById('calendarMessage');

    SetupConditionOfUse();
    SetupColors();
    SetupSettings();
    LoadCachedEvents();
    await LoadPromotions();
    await getMyEvents();
    calendarMessage.style.display = 'none';
    UpdateClasses();
});

async function LoadPromotions()
{
    myPromotions = await sendRequest('classes/my');

    if(myPromotions.code === 401)
    {
        calendarMessage.style.display = 'block';
        calendarMessage.textContent = "Token invalide ou manquant";
    }
    else if(myPromotions.code === 402)
    {
        calendarMessage.textContent = "Veuillez accepter les conditions d'utilisation";
    }

    // show a list of promotions in html
    myPromotions.data.forEach(promotion =>
    {
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = promotion.promotion_id;
        checkbox.value = promotion.id;

        // load the selected promotions
        let selectedPromotions = JSON.parse(localStorage.getItem('promotions'));
        if (selectedPromotions)
        {
            if (selectedPromotions.includes(promotion.promotion_id))
            {
                checkbox.checked = true;
            }
        }

        checkbox.addEventListener('change', SavePromotions);

        let label = document.createElement('label');
        label.htmlFor = `promotion_${promotion.id}`;
        label.appendChild(document.createTextNode(promotion['promotion_label']));

        let div = document.createElement('div');
        div.className = 'promotion-item';
        div.appendChild(checkbox);
        div.appendChild(label);

        div.addEventListener('click', function() {
            checkbox.click();
        });

        checkbox.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        promotionList.appendChild(div);
    });
}

function LoadCachedEvents()
{
    let events = JSON.parse(localStorage.getItem('events'));
    if (events)
    {
        console.log("loading events from cache");
        calendarMessage.textContent = "Les événements affichés actuellement proviennent du cache. Si une mise à jour a été effectuée, veuillez patienter jusqu'à ce que ce message disparaisse.";
        calendarMessage.style.display = 'block';
        calendar = new Calendar(events);
    }
}

function SetupSettings()
{
    const openSettingsButton = document.getElementById('settings');
    const openSettingsButtonBurger = document.getElementById('settingsBurger');
    const popupContainer = document.getElementById('popup');

    openSettingsButtonBurger.addEventListener('click', () =>
    {
        popupContainer.style.display = 'flex';
        closeBurgerMenu();
    });

    openSettingsButton.addEventListener('click', () =>
    {
        popupContainer.style.display = 'flex';
    });


    popupContainer.addEventListener('click', (event) =>
    {
        if (event.target === popupContainer)
        {
            popupContainer.style.display = 'none';
        }
    });

    let token = localStorage.getItem('token');
    if (token)
    {
        document.getElementById('token').value = token;
    }
    else
    {
        console.warn('Token is empty');
    }

    let clearSettingsButton = document.getElementById('clearSettings');

    clearSettingsButton.addEventListener('click', function()
    {
        localStorage.removeItem("classes");
        localStorage.removeItem("promotions");
        localStorage.removeItem("colors");
        localStorage.removeItem("events");
        localStorage.removeItem("token");
        localStorage.removeItem("conditionOfUse");

        location.reload();
    });
}


function SetupColors()
{
    let colorInputs = document.querySelectorAll('.colorInput');
    colorInputs.forEach(input =>
    {
        input.addEventListener('change', function()
        {
            let colors = localStorage.getItem('colors');

            if(colors)
            {
                colors = JSON.parse(colors);
            }
            else
            {
                colors = {};
            }

            colors[input.dataset.classId] = this.value;

            localStorage.setItem('colors', JSON.stringify(colors));

            calendar.UpdateColors();
        });
    });

    LoadColors();
}

function LoadColors()
{
    let colors = JSON.parse(localStorage.getItem('colors'));
    if(colors)
    {
        for (const [key, value] of Object.entries(colors)) {
            let input = document.querySelector(`.colorInput[data-class-id="${key}"]`);
            if (input)
            {
                input.value = value;
            }
        }
    }
}

function SetupConditionOfUse()
{
    if(localStorage.getItem('conditionOfUse') !== 'accepted')
    {
        document.getElementById('conditions-container').style.display = 'flex';

        let conditionButton = document.getElementById('acceptConditions');

        conditionButton.addEventListener('click', function()
        {
            localStorage.setItem('conditionOfUse', 'accepted');
            location.reload();
        });
    }
}

function UpdateClasses()
{
    let classes = calendar.classes;

    if(classes)
    {

        // clear the classes
        class_b1.innerHTML = '';
        class_b2.innerHTML = '';
        class_b3.innerHTML = '';
        class_other.innerHTML = '';


        let i = 0;
        let selectedClasses = JSON.parse(localStorage.getItem('classes'));
        classes.forEach(classe =>
        {
            let input = document.createElement('input');
            input.type = "checkbox";
            // check in local storage if the class is selected

            if (selectedClasses && selectedClasses.length > 0)
            {
                let isNotSelected = selectedClasses.some(selectedClass => selectedClass.cours == classe.cours && Number(selectedClass.year) == Number(classe.year));
                input.checked = !isNotSelected;
            }
            else
            {
                input.checked = true;
            }

            input.addEventListener('change', saveClasses);

            let label = document.createElement('label');
            label.textContent = classe.cours;
            label.prepend(input);

            let div = document.createElement('div');
            div.className = 'promotion-item';
            div.appendChild(label);

            div.addEventListener('click', function() {
                input.click();
            });

            input.addEventListener('click', function(event) {
                event.stopPropagation();
            });

            if(classe.year == 0)
            {
                class_b1.appendChild(div);
            }
            else if(classe.year == 1)
            {
                class_b2.appendChild(div);
            }
            else if(classe.year == 2)
            {
                class_b3.appendChild(div);
            }
            else
            {
                class_other.appendChild(div);
            }
            i++;
        });
    }


}

function saveClasses()
{

    console.log('saving classes');

    localStorage.removeItem('classes');
    localStorage.setItem('classes', JSON.stringify([]));

    let classes = JSON.parse(localStorage.getItem('classes'));

    Array.from(class_b1.children).forEach(element =>
    {
        let label = element.children[0];
        let input = label.children[0];

        if (!input.checked)
        {
            classes.push({cours : label.textContent, year : '0'});
        }
    });

    Array.from(class_b2.children).forEach(element =>
    {
        let label = element.children[0];
        let input = label.children[0];
        if (!input.checked)
        {
            classes.push({cours : label.textContent, year : '1'});
        }
    });

    Array.from(class_b3.children).forEach(element =>
    {
        let label = element.children[0];
        let input = label.children[0];
        if (!input.checked)
        {
            classes.push({cours : label.textContent, year : '2'});
        }
    });

    Array.from(class_other.children).forEach(element =>
    {
        let label = element.children[0];
        let input = label.children[0];

        if (!input.checked)
        {
            classes.push({cours : label.textContent, year : '3'});
        }
    });

    localStorage.setItem('classes', JSON.stringify(classes));

    Updatecalendar(); // update direcly the calendar to avoid any delay and show the result smoothly
    getMyEvents(); // then update in background the events
}

async function SavePromotions()
{

    console.log('saving promotions');

    localStorage.removeItem('promotions');
    let promotions = [];

    Array.from(promotionList.children).forEach(promotion =>
    {
        let checkbox = promotion.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked)
        {
            promotions.push(checkbox.id);
        }
    });


    localStorage.setItem('promotions', JSON.stringify(promotions));

    await getMyEvents(); // update in background the events
    UpdateClasses();
}

function UpdateToken()
{
    let token = document.getElementById('token').value;

    if (token)
    {
        localStorage.setItem('token', token);

        window.location.reload();
    }
    else
    {
        console.error('Token is empty');
    }
}

async function GetClasses(events)
{
    events.forEach(event =>
    {
        let title = event['title'];
        let level = GetLevelOfEvent(title);

        if (level)
        {
            classes[level].push(event);
        }
    });

}


async function getMyEvents()
{
    let promotionsId = getSelectedPromotions();

    let url = "plannings/promotion/[" + promotionsId + "]";
    let events = await sendRequest(url);


    let oldDate;
    if(calendar && calendar.calendar)
    {
        oldDate = calendar.calendar.getDate();
    }

    calendar = new Calendar(events, oldDate);
}

async function Updatecalendar()
{
    let oldDate;
    if(calendar)
    {
        oldDate = calendar.calendar.getDate();
        calendar = new Calendar(calendar.events, oldDate);
    }
}

function getSelectedPromotions()
{
    let selectedPromotions = '';
    let checkboxes = document.querySelectorAll('#promotions-list input[type="checkbox"]');

    checkboxes.forEach(checkbox =>
    {
        if (checkbox.checked) {
            selectedPromotions += (checkbox.value + ',');
        }
    });

    selectedPromotions = selectedPromotions.slice(0, -1);
    return selectedPromotions;
}


function ImportSettings()
{
    let ImportedSettings = document.getElementById('ImportSettings').value;

    if(ImportedSettings)
    {
        let settings;
        try
        {
            settings = JSON.parse(ImportedSettings);
        } catch (e)
        {
            console.error('Invalid JSON format');
            return;
        }
        localStorage.setItem('token', settings.token);


        let colors =
            {
                "0" : settings.colors[0],
                "1" : settings.colors[1],
                "2" : settings.colors[2],
                "3" : settings.colors[3],
            }
        localStorage.setItem('colors', JSON.stringify(colors));
        localStorage.setItem('promotions', settings.promotions);

        let oldClasses = settings.classes;
        let classes = [];

        oldClasses = JSON.parse(oldClasses);

        oldClasses.forEach(oldClass =>
        {
            classes.push({cours : oldClass.classe, year : Number(oldClass.year) === 0 ? 3 : oldClass.year - 1});
        });

       localStorage.setItem('classes', JSON.stringify(classes));

       location.reload();
    }
}
